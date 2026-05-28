import mongoose from "mongoose";
import { env } from "./env";

/**
 * Establishes connection to MongoDB.
 * The database name is included in MONGODB_URI directly:
 * mongodb+srv://user:pass@cluster.mongodb.net/travel-itinerary
 */
export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
