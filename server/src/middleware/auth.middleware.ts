/**
 * Protects routes by verifying the JWT access token.
 * Expects: Authorization: Bearer <token>
 *
 * On success: attaches decoded user to req.user and calls next().
 * On failure: throws AppError which bubbles to the global error handler.
 */

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { AppError } from "../utils/AppError";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Authentication required. Please log in.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch {
    throw new AppError("Invalid or expired token. Please log in again.", 401);
  }
};
