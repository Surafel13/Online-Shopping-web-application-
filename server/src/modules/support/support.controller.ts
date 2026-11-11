import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getAuthenticatedUser } from "../../middleware/auth.middleware.js";
import { getEffectivePermissionCodes } from "../rbac/rbac.service.js";
import { faqService } from "./faq.service.js";
import { supportService } from "./support.service.js";
import { openStream } from "./support.realtime.js";
import { removeUploads } from "./support.upload.js";
import { SUPPORT_VIEW_PERMISSION } from "./support.constants.js";

const files = (req: Request) =>
  (Array.isArray(req.files) ? req.files : []) as Express.Multer.File[];
const uid = (req: Request) => getAuthenticatedUser(req).id;
const id = (req: Request) => req.params.id as string;

const ok = (res: Response, data: unknown, status = 200): void => {
  res.status(status).json({ success: true, data });
};

/** Deletes already-uploaded Cloudinary files when the request fails validation. */
const withCleanup = async <T>(req: Request, task: () => Promise<T>) => {
  try {
    return await task();
  } catch (error) {
    await removeUploads(files(req));
    throw error;
  }
};

export const stream = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const isAgent =
    user.role === "super_admin" ||
    (user.role === "admin" &&
      (await getEffectivePermissionCodes(user._id)).includes(
        SUPPORT_VIEW_PERMISSION,
      ));
  openStream(res, user.id, isAgent);
});

/* customer */
export const createTicket = asyncHandler(async (req, res) =>
  ok(
    res,
    await withCleanup(req, () =>
      supportService.createTicket(uid(req), req.body, files(req)),
    ),
    201,
  ),
);

export const listMyTickets = asyncHandler(async (req, res) =>
  ok(res, await supportService.listMyTickets(uid(req), req.query)),
);

export const getMyTicket = asyncHandler(async (req, res) =>
  ok(res, await supportService.getMyTicket(uid(req), id(req))),
);

export const getMyMessages = asyncHandler(async (req, res) =>
  ok(res, await supportService.getMyMessages(uid(req), id(req))),
);

export const replyToTicket = asyncHandler(async (req, res) =>
  ok(
    res,
    await withCleanup(req, () =>
      supportService.customerReply(uid(req), id(req), req.body, files(req)),
    ),
    201,
  ),
);

export const closeMyTicket = asyncHandler(async (req, res) =>
  ok(res, await supportService.closeMyTicket(uid(req), id(req))),
);

export const reopenMyTicket = asyncHandler(async (req, res) =>
  ok(res, await supportService.reopenMyTicket(uid(req), id(req))),
);

export const listPublicFaqs = asyncHandler(async (_req, res) =>
  ok(res, await faqService.listPublished()),
);

/* admin */
export const adminListTickets = asyncHandler(async (req, res) => {
  const { tickets, pagination } = await supportService.listAdminTickets(
    uid(req),
    req.query,
  );

  res.status(200).json({ success: true, data: tickets, pagination });
});

export const adminStats = asyncHandler(async (req, res) =>
  ok(res, await supportService.getStats(uid(req))),
);

export const adminAgents = asyncHandler(async (_req, res) =>
  ok(res, await supportService.getAgents()),
);

export const adminGetTicket = asyncHandler(async (req, res) =>
  ok(res, await supportService.getAdminTicket(id(req))),
);

export const adminGetMessages = asyncHandler(async (req, res) =>
  ok(res, await supportService.getAdminMessages(id(req))),
);

export const adminReply = asyncHandler(async (req, res) =>
  ok(
    res,
    await withCleanup(req, () =>
      supportService.agentReply(uid(req), id(req), req.body, files(req)),
    ),
    201,
  ),
);

export const adminUpdateTicket = asyncHandler(async (req, res) =>
  ok(res, await supportService.updateTicket(uid(req), id(req), req.body)),
);

export const adminListFaqs = asyncHandler(async (_req, res) =>
  ok(res, await faqService.listAll()),
);

export const adminCreateFaq = asyncHandler(async (req, res) =>
  ok(res, await faqService.create(req.body), 201),
);

export const adminUpdateFaq = asyncHandler(async (req, res) =>
  ok(res, await faqService.update(id(req), req.body)),
);

export const adminDeleteFaq = asyncHandler(async (req, res) => {
  await faqService.remove(id(req));
  res.status(200).json({ success: true, message: "FAQ deleted" });
});
