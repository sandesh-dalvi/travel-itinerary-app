/**
 * Establishes connection to MongoDB.
 */

import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGODB_URI, { dbName: "travel-itinerary" });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Log disconnection events in development
mongoose.connection.on("disconnected", () => {
  if (env.NODE_ENV === "development") {
    console.warn("MongoDB disconnected.");
  }
});
