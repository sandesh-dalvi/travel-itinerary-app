import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  // Connect to database before accepting requests
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`\nServer running in ${env.NODE_ENV} mode`);
    console.log(`   URL: http://localhost:${env.PORT}`);
    console.log(`   Health: http://localhost:${env.PORT}/health\n`);
  });

  // Graceful shutdown — finish in-flight requests before closing
  const gracefulShutdown = (signal: string): void => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Catch unhandled promise rejections
  process.on("unhandledRejection", (reason: unknown) => {
    console.error("Unhandled rejection:", reason);
    server.close(() => process.exit(1));
  });
};

startServer();
