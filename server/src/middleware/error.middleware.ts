import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError.utils.js";
import { logger } from "../utils/logger/logger.winston.js";

export const ErrorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  void next;
  // Custom Application Errors
  if (err instanceof AppError) {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${err.message}`);

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Zod Validation Errors
  if (err instanceof ZodError) {
    logger.warn(`[${req.method}] ${req.originalUrl} - Validation Error`);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // JWT Expired
  if (err.name === "TokenExpiredError") {
    logger.warn(`[${req.method}] ${req.originalUrl} - Token Expired`);

    return res.status(401).json({
      success: false,
      message: "Access token expired",
    });
  }

  // JWT Invalid
  if (err.name === "JsonWebTokenError") {
    logger.warn(`[${req.method}] ${req.originalUrl} - Invalid Token`);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    logger.warn(
      `[${req.method}] ${req.originalUrl} - Mongoose Validation Error`,
    );

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    logger.warn(`[${req.method}] ${req.originalUrl} - Invalid ObjectId`);

    return res.status(400).json({
      success: false,
      message: "Invalid resource id",
    });
  }

  // Unknown Errors
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
