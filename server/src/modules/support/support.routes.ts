import { Router } from "express";
import rateLimit from "express-rate-limit";
import { restrictTo } from "../../middleware/role.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { uploadAttachments } from "./support.upload.js";
import * as c from "./support.controller.js";

const writeLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
});

/** Public – mounted without auth. */
export const publicFaqRoute = Router();
publicFaqRoute.get("/", c.listPublicFaqs);

/** Authenticated – mounted behind authMiddleware. */
const supportRoute = Router();

supportRoute.get("/stream", c.stream);

// Customer (always scoped to the signed-in user's own tickets)
supportRoute.post("/tickets", writeLimiter, uploadAttachments, c.createTicket);
supportRoute.get("/tickets/me", c.listMyTickets);
supportRoute.get("/tickets/:id", c.getMyTicket);
supportRoute.get("/tickets/:id/messages", c.getMyMessages);
supportRoute.post("/tickets/:id/messages", writeLimiter, uploadAttachments, c.replyToTicket);
supportRoute.patch("/tickets/:id/close", c.closeMyTicket);
supportRoute.patch("/tickets/:id/reopen", c.reopenMyTicket);
supportRoute.get("/faqs", c.listPublicFaqs);

// Agents (admin with orders permissions, or super admin)
const admin = Router();
admin.use(restrictTo("admin"));
const view = requirePermission("orders", "view");
const manage = requirePermission("orders", "update");

admin.get("/stats", view, c.adminStats);
admin.get("/agents", view, c.adminAgents);
admin.get("/tickets", view, c.adminListTickets);
admin.get("/tickets/:id", view, c.adminGetTicket);
admin.get("/tickets/:id/messages", view, c.adminGetMessages);
admin.post("/tickets/:id/messages", manage, writeLimiter, uploadAttachments, c.adminReply);
admin.patch("/tickets/:id", manage, c.adminUpdateTicket);
admin.get("/faqs", view, c.adminListFaqs);
admin.post("/faqs", manage, c.adminCreateFaq);
admin.patch("/faqs/:id", manage, c.adminUpdateFaq);
admin.delete("/faqs/:id", manage, c.adminDeleteFaq);

supportRoute.use("/admin", admin);

export default supportRoute;
