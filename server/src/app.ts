import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import apiRoutes from "./routes/index";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────

app.use(helmet()); // Sets secure HTTP headers

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // Required for httpOnly cookies to be sent cross-origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Global rate limiter — prevents brute force attacks
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

app.use(globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ─── Body parsing ─────────────────────────────────────────────────────────

app.use(express.json({ limit: "10kb" })); // Reject oversized JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse httpOnly cookies

// ─── Logging (development only) ───────────────────────────────────────────

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health check ─────────────────────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────

app.use("/api", apiRoutes);

// 404 handler — catches any unmatched routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Global error handler ─────────────────────────────────────────────────

// Must be the last middleware — Express identifies error handlers by 4 arguments
app.use(errorHandler);

export default app;
