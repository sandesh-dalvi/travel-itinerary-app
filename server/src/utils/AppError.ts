/**
 * Custom error class for operational errors (predictable errors we handle deliberately,
 * like 404s, validation failures, unauthorized access).
 *
 * The `isOperational` flag lets the global error handler distinguish between
 * these expected errors and unexpected programming errors.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Captures the stack trace properly when this class is instantiated
    Error.captureStackTrace(this, this.constructor);
  }
}
