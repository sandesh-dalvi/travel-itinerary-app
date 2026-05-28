/**
 * Extends the Express Request type to include the authenticated user.
 * After the auth middleware runs, req.user is guaranteed to exist on
 */
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}
