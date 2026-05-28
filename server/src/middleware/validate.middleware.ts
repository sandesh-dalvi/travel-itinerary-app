/**
 * Factory function that returns a middleware validating the request
 * against a provided Zod schema.
 *
 * The schema should validate { body, params, query } as needed.
 * On failure, returns 400 with formatted error messages.
 *
 * Usage:
 *   router.post('/login', validate(loginSchema), authController.login)
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => {
          // Show field path + message: e.g. "body.email: Invalid email address"
          const path = issue.path.slice(1).join("."); // strip leading 'body'/'params'
          return path ? `${path}: ${issue.message}` : issue.message;
        });

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }
      next(error);
    }
  };
