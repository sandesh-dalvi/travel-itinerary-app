/**
 * Core generation pipeline:
 * 1. Fetch + validate document ownership
 * 2. Ensure at least one document has successfully parsed booking data
 * 3. Send all booking data to Gemini as a single generation request
 * 4. Persist the result in MongoDB and return it
 */

import DocumentModel from "../models/Document.model";
import ItineraryModel, { IItineraryDocument } from "../models/Itinerary.model";
import { AppError } from "../utils/AppError";
import { aiService } from "./ai.service";

async function generateItinerary(
  documentIds: string[],
  userId: string,
): Promise<IItineraryDocument> {
  // Fetch only documents owned by this user — prevents accessing others' data
  const documents = await DocumentModel.find({
    _id: { $in: documentIds },
    userId,
  });

  if (documents.length === 0) {
    throw new AppError(
      "No documents found. Please upload your booking documents first.",
      404,
    );
  }

  // Only use documents that Gemini successfully extracted data from
  const readyDocuments = documents.filter(
    (doc) => doc.status === "done" && doc.parsedBookingData,
  );

  if (readyDocuments.length === 0) {
    throw new AppError(
      "None of the selected documents were successfully processed. " +
        "Please re-upload your files and try again.",
      422,
    );
  }

  const bookings = readyDocuments.map((doc) => doc.parsedBookingData!);

  // Single Gemini call that produces the full structured itinerary
  const generated = await aiService.generateItinerary(bookings);

  // Persist the generated itinerary to MongoDB
  const itinerary = await ItineraryModel.create({
    userId,
    documentIds: readyDocuments.map((doc) => doc._id),
    title: generated.title,
    destination: generated.destination,
    startDate: generated.startDate,
    endDate: generated.endDate,
    days: generated.days,
    travelTips: generated.travelTips,
    summary: generated.summary,
  });

  return itinerary;
}

//   Returns all itineraries for a user, newest first
async function getUserItineraries(
  userId: string,
): Promise<IItineraryDocument[]> {
  return ItineraryModel.find({ userId }).sort({ createdAt: -1 });
}

//   Returns a single itinerary, verifying it belongs to the requesting user
async function getById(
  itineraryId: string,
  userId: string,
): Promise<IItineraryDocument> {
  const itinerary = await ItineraryModel.findOne({ _id: itineraryId, userId });
  if (!itinerary) {
    throw new AppError("Itinerary not found.", 404);
  }
  return itinerary;
}

// Hard-deletes the itinerary record (irreversible)
async function deleteItinerary(
  itineraryId: string,
  userId: string,
): Promise<void> {
  const itinerary = await ItineraryModel.findOne({ _id: itineraryId, userId });
  if (!itinerary) {
    throw new AppError("Itinerary not found.", 404);
  }
  await itinerary.deleteOne();
}

export const itineraryService = {
  generateItinerary,
  getUserItineraries,
  getById,
  deleteItinerary,
};
