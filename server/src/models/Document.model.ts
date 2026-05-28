import mongoose, { Document, Schema, Model, Types } from "mongoose";
import type { ParsedBookingData, DocumentStatus, FileType } from "../types";

// Interface
export interface IDocument {
  userId: Types.ObjectId;
  fileName: string; // Original file name from the user
  fileType: FileType;
  fileUrl: string; // Cloudinary secure URL
  cloudinaryPublicId: string; // Needed to delete from Cloudinary later
  rawText?: string; // Raw text extracted from PDFs via pdf-parse
  parsedBookingData?: ParsedBookingData; // Structured data from Gemini
  status: DocumentStatus;
  errorMessage?: string; // Populated if status === 'failed'
  uploadedAt: Date;
}

export interface IDocumentDocument extends IDocument, Document {}

// Schema
const documentSchema = new Schema<IDocumentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Indexed for fast user-specific queries
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "image"] satisfies FileType[],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
    },
    parsedBookingData: {
      type: Schema.Types.Mixed, // Flexible JSON structure
    },
    status: {
      type: String,
      enum: ["processing", "done", "failed"] satisfies DocumentStatus[],
      default: "processing",
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

// Model
const DocumentModel: Model<IDocumentDocument> =
  mongoose.model<IDocumentDocument>("Document", documentSchema);
export default DocumentModel;
