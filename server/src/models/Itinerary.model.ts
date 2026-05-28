import mongoose, { Document, Schema, Model, Types } from "mongoose";
import type { ItineraryDay } from "../types";

// Interface
export interface IItinerary {
  userId: Types.ObjectId;
  documentIds: Types.ObjectId[]; // Source documents used for generation
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
  travelTips: string[];
  summary: string;
  shareToken?: string; // Unique token for the public share link
  isPublic: boolean;
  shareExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IItineraryDocument extends IItinerary, Document {}

// Subdocument schemas
const activitySchema = new Schema(
  {
    time: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "travel",
        "accommodation",
        "sightseeing",
        "dining",
        "leisure",
        "other",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String },
  },
  { _id: false }, // Subdocs don't need their own _id
);

const daySchema = new Schema(
  {
    dayNumber: { type: Number, required: true },
    date: { type: String, required: true },
    title: { type: String, required: true },
    activities: [activitySchema],
  },
  { _id: false },
);

// Schema
const itinerarySchema = new Schema<IItineraryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: [daySchema],
    travelTips: [{ type: String }],
    summary: { type: String },
    shareToken: {
      type: String,
      unique: true,
      sparse: true, // sparse index — only indexed when the field exists
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false },
);

// Model
const Itinerary: Model<IItineraryDocument> = mongoose.model<IItineraryDocument>(
  "Itinerary",
  itinerarySchema,
);
export default Itinerary;
