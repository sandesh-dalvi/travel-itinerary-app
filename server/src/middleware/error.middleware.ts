/**
 * Global error handling middleware — the single point where all errors land.
 *
 * Express 5 automatically catches async errors from route handlers,
 * so we don't need try/catch in controllers.
 *
 * Two categories of errors:
 *  - Operational (AppError): predictable errors we handle deliberately → send clean message
 *  - Programming errors: unexpected bugs → log stack, send generic 500 in production
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Operational error — safe to expose message to client
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose duplicate key error (e.g. email already registered)
  if (
    (err as NodeJS.ErrnoException).name === "MongoServerError" &&
    (err as any).code === 11000
  ) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `An account with this ${field} already exists.`,
    });
    return;
  }

  // Mongoose cast error (e.g. invalid ObjectId in params)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  // Unexpected/programming error — log full stack, hide details from client in production
  console.error("Unexpected error:", err);

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong. Please try again later.",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
