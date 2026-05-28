import { PDFParse } from "pdf-parse";

import {
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from "../config/cloudinary";
import DocumentModel, { IDocumentDocument } from "../models/Document.model";
import { AppError } from "../utils/AppError";
import { aiService } from "./ai.service";
import { GetDocumentsQuery } from "../schemas/document.schema";

// Upload document process
async function uploadProcess(
  file: Express.Multer.File,
  userId: string,
): Promise<IDocumentDocument> {
  const isPdf = file.mimetype === "application/pdf";
  const fileType = isPdf ? "pdf" : "image";

  //  Upload to Cloudinary
  const { url, publicId } = await uploadBufferToCloudinary(file.buffer, {
    folder: `travel-itinerary/${userId}`,
    resource_type: isPdf ? "raw" : "image",
  });

  //   Extract text + parse booking data
  let rawText: string | undefined;
  let parsedBookingData;
  let status: "done" | "failed" = "done";
  let errorMessage: string | undefined;

  try {
    if (isPdf) {
      const pdfData = new PDFParse(new Uint8Array(file.buffer));
      const pdfParse = await pdfData.getText();
      rawText = pdfParse.text;

      if (!rawText?.trim()) {
        throw new AppError("PDF contains no extractable text", 422);
      }

      parsedBookingData = await aiService.extractFromText(rawText);
    } else {
      // for images
      parsedBookingData = await aiService.extractFromImage(
        file.buffer,
        file.mimetype,
      );
    }
  } catch (err) {
    status = "failed";
    errorMessage =
      err instanceof Error ? err.message : "Unknown error during AI processing";
    console.error(
      `[document.service] Extraction failed for ${file.originalname}: `,
      err,
    );
  }

  //   Save document record to DB
  const document = await DocumentModel.create({
    userId,
    fileName: file.originalname,
    fileType,
    fileUrl: url,
    cloudinaryPublicId: publicId,
    rawText,
    parsedBookingData,
    status,
    errorMessage,
  });

  return document;
}

// Get user documents
async function getUserDocuments(
  userId: string,
  { page, limit }: GetDocumentsQuery,
) {
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    DocumentModel.find({ userId })
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit),
    DocumentModel.countDocuments({ userId }),
  ]);

  return {
    documents,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get document by ID
async function getDocumentById(
  documentId: string,
  userId: string,
): Promise<IDocumentDocument> {
  const document = await DocumentModel.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError("Document not found.", 404);
  }
  return document;
}

// Delete document
async function deleteDocument(
  documentId: string,
  userId: string,
): Promise<void> {
  const document = await DocumentModel.findOne({ _id: documentId, userId });
  if (!document) {
    throw new AppError("Document not found.", 404);
  }

  const resourceType = document.fileType === "pdf" ? "raw" : "image";
  await deleteFromCloudinary(document.cloudinaryPublicId, resourceType);
  await document.deleteOne();
}

export const documentService = {
  uploadProcess,
  getUserDocuments,
  getDocumentById,
  deleteDocument,
};
