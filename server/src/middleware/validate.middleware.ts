import type{ Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let filePaths: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        filePaths = (req.files as Express.Multer.File[]).map(file => file.path);
      } else if (req.file) {
        filePaths = [req.file.path];
      }

      const dataToValidate = {
        ...req.body,
        ...(filePaths.length > 0 && { images: filePaths })
      };

      const validatedData = await schema.parseAsync(dataToValidate);
      req.body = validatedData;

      return next();
    } catch (error) {
      return next(error);
    }
  };
};