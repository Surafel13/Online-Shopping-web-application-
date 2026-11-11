import { Types } from "mongoose";
import SupportTicket, { nextTicketNumber } from "../../database/supportTicket.model.js";
import SupportMessage from "../../database/supportMessage.model.js";
import Order from "../../database/order.model.js";
import Users from "../../database/users.model.js";
import { AppError } from "../../utils/appError.utils.js";
import { getEffectivePermissionCodes } from "../rbac/rbac.service.js";
import { notificationService } from "../notifications/notification.service.js";
import { emitToAgents, emitToUsers } from "./support.realtime.js";
import {
  MAX_OPEN_TICKETS, REOPEN_WINDOW_DAYS, STATUS_LABELS, SUPPORT_MANAGE_PERMISSION,
  type TicketStatus,
} from "./support.constants.js";
import {
  adminTicketsQuerySchema, agentReplySchema, createTicketSchema, customerReplySchema,
  myTicketsQuerySchema, updateTicketSchema,
} from "./support.validation.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
const SENDER_SELECT = "username profileImg";
const adminLink = (id: unknown) => `/admin/support?ticket=${String(id)}`;
const customerLink = (id: unknown) => `/support/tickets/${String(id)}`;

const assertId = (id: string, label = "ticket") => {
  if (!Types.ObjectId.isValid(id)) throw new AppError(`Invalid ${label} id`, 400);
};
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const preview = (text: string, hasFiles: boolean) =>
  (text.trim() || (hasFiles ? "Sent an attachment" : "")).slice(0, 140);
const toAttachments = (files?: Express.Multer.File[]) =>
  (files ?? []).map((f) => ({
    url: f.path,
    name: f.originalname.slice(0, 120),
    mimeType: f.mimetype,
    size: f.size,
  }));

const applyStatus = (ticket: InstanceType<typeof SupportTicket>, status: TicketStatus) => {
  ticket.status = status;
  const now = new Date();
  if (status === "resolved") {
    ticket.resolvedAt = now;
    ticket.closedAt = null;
  } else if (status === "closed") {
    ticket.closedAt = now;
    ticket.resolvedAt ??= now;
  } else {
    ticket.resolvedAt = null;
    ticket.closedAt = null;
  }
};

export class SupportService {
  /* ----------------------------- helpers ----------------------------- */

  private async isHandler(userId: string | Types.ObjectId, role: string) {
    if (role === "super_admin") return true;
    if (role !== "admin") return false;
    return (await getEffectivePermissionCodes(userId)).includes(SUPPORT_MANAGE_PERMISSION);
  }

  /** Active admins / super admins allowed to work tickets. */
  async getAgents() {
    const users = await Users.find({ role: { $in: ["admin", "super_admin"] }, isActive: true })
      .select("username email role profileImg")
      .lean();
    const flags = await Promise.all(users.map((u) => this.isHandler(u._id, u.role)));
    return users.filter((_, i) => flags[i]);
  }

  private async getHandlerIds() {
    return (await this.getAgents()).map((a) => String(a._id));
  }

  private async agentRecipients(assignedTo?: Types.ObjectId | null) {
    return assignedTo ? [String(assignedTo)] : this.getHandlerIds();
  }

  private loadTicket(id: string) {
    return SupportTicket.findById(id)
      .populate("user", "username email profileImg")
      .populate("assignedTo", SENDER_SELECT)
      .populate("order", "totalAmount orderStatus paymentStatus createdAt")
      .lean();
  }

  private async publishMessage(ticketId: string, messageId: unknown, ownerId: string, isInternal: boolean) {
    const [message, ticket] = await Promise.all([
      SupportMessage.findById(messageId as string).populate("sender", SENDER_SELECT).lean(),
      this.loadTicket(ticketId),
    ]);
    if (!message || !ticket) return message;
    const payload = { ticketId, message, ticket };
    if (!isInternal) emitToUsers([ownerId], "message", payload);
    emitToAgents("message", payload);
    return message;
  }

  private async publishTicket(ticketId: string, ownerId: string) {
    const ticket = await this.loadTicket(ticketId);
    if (!ticket) return;
    emitToUsers([ownerId], "ticket", { ticketId, ticket });
    emitToAgents("ticket", { ticketId, ticket });
  }

  private async addSystemMessage(ticketId: Types.ObjectId, ownerId: string, body: string, isInternal: boolean) {
    const message = await SupportMessage.create({
      ticket: ticketId, sender: null, senderRole: "system", body, attachments: [], isInternal,
    });
    await this.publishMessage(String(ticketId), message._id, ownerId, isInternal);
  }

  private async assertHandler(userId: string) {
    const user = await Users.findOne({ _id: userId, isActive: true, role: { $in: ["admin", "super_admin"] } })
      .select("role username")
      .lean();
    if (!user || !(await this.isHandler(userId, user.role))) {
      throw new AppError("That user cannot be assigned support tickets", 400);
    }
    return user;
  }

  /* ---------------------------- customer side ---------------------------- */

  async createTicket(userId: string, input: unknown, files?: Express.Multer.File[]) {
    const data = createTicketSchema.parse(input);
    const attachments = toAttachments(files);

    if (data.orderId && !(await Order.exists({ _id: data.orderId, userId }))) {
      throw new AppError("Order not found", 404);
    }
    const openCount = await SupportTicket.countDocuments({
      user: userId, status: { $nin: ["resolved", "closed"] },
    });
    if (openCount >= MAX_OPEN_TICKETS) {
      throw new AppError(`You already have ${MAX_OPEN_TICKETS} open tickets. Please wait for a resolution first.`, 429);
    }

    const userObjectId = new Types.ObjectId(userId);
    const ticket = await SupportTicket.create({
      ticketNumber: await nextTicketNumber(),
      user: userObjectId,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      status: "open",
      order: data.orderId ? new Types.ObjectId(data.orderId) : null,
      lastMessageAt: new Date(),
      lastMessagePreview: preview(data.description, attachments.length > 0),
      unreadForAgents: true,
      unreadForCustomer: false,
    });
    const message = await SupportMessage.create({
      ticket: ticket._id, sender: userObjectId, senderRole: "customer",
      body: data.description, attachments, isInternal: false,
    });

    const id = String(ticket._id);
    await this.publishMessage(id, message._id, userId, false);
    await notificationService.notify(await this.getHandlerIds(), {
      type: "support_new_ticket",
      title: `New ${data.priority} priority ticket ${ticket.ticketNumber}`,
      body: data.subject,
      link: adminLink(id),
      ticket: id,
    });
    return this.loadTicket(id);
  }

  async listMyTickets(userId: string, rawQuery: unknown) {
    const { status } = myTicketsQuerySchema.parse(rawQuery);
    return SupportTicket.find({ user: userId, ...(status ? { status } : {}) })
      .populate("assignedTo", SENDER_SELECT)
      .sort({ lastMessageAt: -1 })
      .limit(200)
      .lean();
  }

  async getMyTicket(userId: string, id: string) {
    assertId(id);
    const exists = await SupportTicket.findOneAndUpdate(
      { _id: id, user: userId }, { $set: { unreadForCustomer: false } },
    ).select("_id");
    if (!exists) throw new AppError("Ticket not found", 404);
    return this.loadTicket(id);
  }

  async getMyMessages(userId: string, id: string) {
    assertId(id);
    if (!(await SupportTicket.exists({ _id: id, user: userId }))) throw new AppError("Ticket not found", 404);
    return SupportMessage.find({ ticket: id, isInternal: false })
      .populate("sender", SENDER_SELECT).sort({ createdAt: 1 }).lean();
  }

  async customerReply(userId: string, id: string, input: unknown, files?: Express.Multer.File[]) {
    assertId(id);
    const data = customerReplySchema.parse(input);
    const attachments = toAttachments(files);
    if (!data.body && !attachments.length) throw new AppError("Write a message or attach a file.", 400);

    const ticket = await SupportTicket.findOne({ _id: id, user: userId });
    if (!ticket) throw new AppError("Ticket not found", 404);
    if (ticket.status === "closed") throw new AppError("This ticket is closed. Reopen it to send a message.", 400);

    const message = await SupportMessage.create({
      ticket: ticket._id, sender: new Types.ObjectId(userId), senderRole: "customer",
      body: data.body, attachments, isInternal: false,
    });
    ticket.lastMessageAt = new Date();
    ticket.lastMessagePreview = preview(data.body, attachments.length > 0);
    ticket.unreadForAgents = true;
    ticket.unreadForCustomer = false;
    if (ticket.status === "waiting_customer" || ticket.status === "resolved") {
      applyStatus(ticket, ticket.assignedTo ? "in_progress" : "open");
    }
    await ticket.save();

    const saved = await this.publishMessage(id, message._id, userId, false);
    await notificationService.notify(await this.agentRecipients(ticket.assignedTo), {
      type: "support_customer_reply",
      title: `Customer replied on ${ticket.ticketNumber}`,
      body: preview(data.body, attachments.length > 0),
      link: adminLink(id),
      ticket: id,
    });
    return saved;
  }

  async closeMyTicket(userId: string, id: string) {
    assertId(id);
    const ticket = await SupportTicket.findOne({ _id: id, user: userId });
    if (!ticket) throw new AppError("Ticket not found", 404);
    if (ticket.status === "closed") throw new AppError("Ticket is already closed", 400);
    applyStatus(ticket, "closed");
    ticket.unreadForAgents = true;
    await ticket.save();
    await this.addSystemMessage(ticket._id, userId, "Ticket closed by the customer", false);
    await this.publishTicket(id, userId);
    await notificationService.notify(await this.agentRecipients(ticket.assignedTo), {
      type: "support_status", title: `${ticket.ticketNumber} was closed by the customer`,
      body: ticket.subject, link: adminLink(id), ticket: id,
    });
    return this.loadTicket(id);
  }

  async reopenMyTicket(userId: string, id: string) {
    assertId(id);
    const ticket = await SupportTicket.findOne({ _id: id, user: userId });
    if (!ticket) throw new AppError("Ticket not found", 404);
    if (ticket.status !== "closed" && ticket.status !== "resolved") {
      throw new AppError("Only resolved or closed tickets can be reopened", 400);
    }
    const since = ticket.closedAt ?? ticket.resolvedAt;
    if (since && Date.now() - since.getTime() > REOPEN_WINDOW_DAYS * 86_400_000) {
      throw new AppError(`Tickets can only be reopened within ${REOPEN_WINDOW_DAYS} days. Please open a new ticket.`, 400);
    }
    applyStatus(ticket, ticket.assignedTo ? "in_progress" : "open");
    ticket.unreadForAgents = true;
    await ticket.save();
    await this.addSystemMessage(ticket._id, userId, "Ticket reopened by the customer", false);
    await this.publishTicket(id, userId);
    await notificationService.notify(await this.agentRecipients(ticket.assignedTo), {
      type: "support_status", title: `${ticket.ticketNumber} was reopened`,
      body: ticket.subject, link: adminLink(id), ticket: id,
    });
    return this.loadTicket(id);
  }

  /* ------------------------------ agent side ------------------------------ */

  async listAdminTickets(agentId: string, rawQuery: unknown) {
    const q = adminTicketsQuerySchema.parse(rawQuery);
    const filter: Record<string, any> = {};
    if (q.status) filter.status = q.status;
    if (q.priority) filter.priority = q.priority;
    if (q.category) filter.category = q.category;
    if (q.assigned === "me") filter.assignedTo = new Types.ObjectId(agentId);
    else if (q.assigned === "unassigned") filter.assignedTo = null;
    else if (q.assigned) filter.assignedTo = new Types.ObjectId(q.assigned);

    if (q.search) {
      const rx = new RegExp(escapeRegex(q.search), "i");
      const users = await Users.find({ $or: [{ username: rx }, { email: rx }] }).select("_id").limit(50).lean();
      filter.$or = [{ subject: rx }, { ticketNumber: rx }, { user: { $in: users.map((u) => u._id) } }];
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .populate("user", "username email profileImg")
        .populate("assignedTo", SENDER_SELECT)
        .sort({ lastMessageAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit)
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);
    return { tickets, pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) } };
  }

  async getStats(agentId: string) {
    const active = { $in: ["open", "in_progress", "waiting_customer"] };
    const count = (f: Record<string, any>) => SupportTicket.countDocuments(f);
    const [total, open, inProgress, waiting, resolved, closed, unassigned, urgent, mine, response] =
      await Promise.all([
        count({}), count({ status: "open" }), count({ status: "in_progress" }),
        count({ status: "waiting_customer" }), count({ status: "resolved" }), count({ status: "closed" }),
        count({ assignedTo: null, status: active }), count({ priority: "urgent", status: active }),
        count({ assignedTo: new Types.ObjectId(agentId), status: active }),
        SupportTicket.aggregate([
          { $match: { firstResponseAt: { $ne: null } } },
          { $group: { _id: null, avg: { $avg: { $subtract: ["$firstResponseAt", "$createdAt"] } } } },
        ]),
      ]);
    return {
      total, open, inProgress, waiting, resolved, closed, unassigned, urgent, mine,
      avgFirstResponseMinutes: response[0]?.avg ? Math.round(response[0].avg / 60000) : null,
    };
  }

  async getAdminTicket(id: string) {
    assertId(id);
    const exists = await SupportTicket.findByIdAndUpdate(id, { $set: { unreadForAgents: false } }).select("_id");
    if (!exists) throw new AppError("Ticket not found", 404);
    return this.loadTicket(id);
  }

  async getAdminMessages(id: string) {
    assertId(id);
    if (!(await SupportTicket.exists({ _id: id }))) throw new AppError("Ticket not found", 404);
    return SupportMessage.find({ ticket: id }).populate("sender", SENDER_SELECT).sort({ createdAt: 1 }).lean();
  }

  async agentReply(agentId: string, id: string, input: unknown, files?: Express.Multer.File[]) {
    assertId(id);
    const data = agentReplySchema.parse(input);
    const attachments = toAttachments(files);
    if (!data.body && !attachments.length) throw new AppError("Write a message or attach a file.", 400);

    const ticket = await SupportTicket.findById(id);
    if (!ticket) throw new AppError("Ticket not found", 404);
    const ownerId = String(ticket.user);
    if (ticket.status === "closed" && !data.isInternal) {
      throw new AppError("This ticket is closed. Change its status before replying to the customer.", 400);
    }

    const message = await SupportMessage.create({
      ticket: ticket._id, sender: new Types.ObjectId(agentId), senderRole: "agent",
      body: data.body, attachments, isInternal: data.isInternal,
    });

    if (!data.isInternal) {
      ticket.lastMessageAt = new Date();
      ticket.lastMessagePreview = preview(data.body, attachments.length > 0);
      ticket.unreadForCustomer = true;
      ticket.unreadForAgents = false;
      ticket.firstResponseAt ??= new Date();
      ticket.assignedTo ??= new Types.ObjectId(agentId);
      if (data.status && data.status !== ticket.status) applyStatus(ticket, data.status);
      else if (ticket.status === "open") applyStatus(ticket, "in_progress");
      await ticket.save();
    }

    const saved = await this.publishMessage(id, message._id, ownerId, data.isInternal);
    if (!data.isInternal) {
      await this.publishTicket(id, ownerId);
      await notificationService.notify([ownerId], {
        type: "support_agent_reply",
        title: `New reply on ${ticket.ticketNumber}`,
        body: preview(data.body, attachments.length > 0),
        link: customerLink(id),
        ticket: id,
      });
    }
    return saved;
  }

  async updateTicket(agentId: string, id: string, input: unknown) {
    assertId(id);
    const data = updateTicketSchema.parse(input);
    const ticket = await SupportTicket.findById(id);
    if (!ticket) throw new AppError("Ticket not found", 404);
    const ownerId = String(ticket.user);
    const agent = await Users.findById(agentId).select("username").lean();
    const agentName = agent?.username ?? "Support";

    const notes: { body: string; internal: boolean }[] = [];
    let statusChanged = false;
    let newAssignee: string | null = null;

    if (data.status && data.status !== ticket.status) {
      applyStatus(ticket, data.status);
      ticket.unreadForCustomer = true;
      statusChanged = true;
      notes.push({ body: `Status changed to ${STATUS_LABELS[data.status]}`, internal: false });
    }
    if (data.priority && data.priority !== ticket.priority) {
      notes.push({ body: `${agentName} changed priority from ${ticket.priority} to ${data.priority}`, internal: true });
      ticket.priority = data.priority;
    }
    if (data.category && data.category !== ticket.category) {
      notes.push({ body: `${agentName} changed category to ${data.category}`, internal: true });
      ticket.category = data.category;
    }
    if (data.assignedTo !== undefined) {
      if (data.assignedTo === null) {
        if (ticket.assignedTo) {
          ticket.assignedTo = null;
          notes.push({ body: `${agentName} unassigned this ticket`, internal: true });
        }
      } else if (String(ticket.assignedTo) !== data.assignedTo) {
        const target = await this.assertHandler(data.assignedTo);
        ticket.assignedTo = new Types.ObjectId(data.assignedTo);
        notes.push({ body: `${agentName} assigned this ticket to ${target.username}`, internal: true });
        if (data.assignedTo !== agentId) newAssignee = data.assignedTo;
      }
    }

    if (!notes.length) return this.loadTicket(id);
    await ticket.save();
    for (const note of notes) await this.addSystemMessage(ticket._id, ownerId, note.body, note.internal);
    await this.publishTicket(id, ownerId);

    if (statusChanged && data.status) {
      await notificationService.notify([ownerId], {
        type: "support_status",
        title: `Ticket ${ticket.ticketNumber} is now ${STATUS_LABELS[data.status].toLowerCase()}`,
        body: ticket.subject,
        link: customerLink(id),
        ticket: id,
      });
    }
    if (newAssignee) {
      await notificationService.notify([newAssignee], {
        type: "support_assigned",
        title: `${ticket.ticketNumber} was assigned to you`,
        body: ticket.subject,
        link: adminLink(id),
        ticket: id,
      });
    }
    return this.loadTicket(id);
  }
}

export const supportService = new SupportService();
