import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";
import { AppError } from "../../utils/appError.utils.js";
import {
  ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENTS, MAX_ATTACHMENT_SIZE,
} from "./support.constants.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "support",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  }),
});

const uploader = multer({
  storage,
  limits: { fileSize: MAX_ATTACHMENT_SIZE, files: MAX_ATTACHMENTS },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_ATTACHMENT_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new AppError("Only JPG, PNG, WebP or PDF files are allowed.", 400));
  },
}).array("attachments", MAX_ATTACHMENTS);

export const uploadAttachments = (req: Request, res: Response, next: NextFunction) => {
  uploader(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Each attachment must be 5 MB or smaller."
          : `You can attach up to ${MAX_ATTACHMENTS} files.`;
      return next(new AppError(message, 400));
    }
    if (err) return next(err);
    next();
  });
};

export const removeUploads = async (files: Express.Multer.File[]) => {
  await Promise.allSettled(files.map((f) => cloudinary.uploader.destroy(f.filename)));
};
