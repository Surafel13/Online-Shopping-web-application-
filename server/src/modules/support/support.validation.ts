import { z } from "zod";
import {
  TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES,
} from "./support.constants.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

export const createTicketSchema = z.object({
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(120),
  category: z.enum(TICKET_CATEGORIES, { message: "Choose a valid category" }),
  // Customers can't self-assign "urgent"; agents can escalate.
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  description: z.string().trim().min(10, "Describe your issue in at least 10 characters").max(5000),
  orderId: z.preprocess(emptyToUndefined, objectId.optional()),
});

export const customerReplySchema = z.object({
  body: z.string().trim().max(5000).default(""),
});

export const agentReplySchema = z.object({
  body: z.string().trim().max(5000).default(""),
  isInternal: z.preprocess((v) => v === true || v === "true", z.boolean()),
  status: z.preprocess(emptyToUndefined, z.enum(TICKET_STATUSES).optional()),
});

export const updateTicketSchema = z
  .object({
    status: z.enum(TICKET_STATUSES).optional(),
    priority: z.enum(TICKET_PRIORITIES).optional(),
    category: z.enum(TICKET_CATEGORIES).optional(),
    assignedTo: objectId.nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });

const page = z.coerce.number().int().min(1).default(1);
const limit = (max: number, def: number) => z.coerce.number().int().min(1).max(max).default(def);

export const myTicketsQuerySchema = z.object({
  status: z.preprocess(emptyToUndefined, z.enum(TICKET_STATUSES).optional()),
});

export const adminTicketsQuerySchema = z.object({
  page,
  limit: limit(50, 15),
  status: z.preprocess(emptyToUndefined, z.enum(TICKET_STATUSES).optional()),
  priority: z.preprocess(emptyToUndefined, z.enum(TICKET_PRIORITIES).optional()),
  category: z.preprocess(emptyToUndefined, z.enum(TICKET_CATEGORIES).optional()),
  assigned: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((v) => v === "me" || v === "unassigned" || /^[0-9a-fA-F]{24}$/.test(v), "Invalid filter")
      .optional(),
  ),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
});

export const pageQuerySchema = z.object({
  page,
  limit: limit(50, 20),
  unreadOnly: z.preprocess((v) => v === "true", z.boolean()),
});

export const createFaqSchema = z.object({
  question: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(5).max(5000),
  category: z.string().trim().min(2).max(40).default("General"),
  isPublished: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});
export const updateFaqSchema = createFaqSchema.partial();
