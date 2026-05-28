import { randomBytes } from "crypto";
import ItineraryModel, { IItineraryDocument } from "../models/Itinerary.model";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

type ExpiresIn = "7d" | "30d" | "never";

const EXPIRY_MS: Record<ExpiresIn, number | null> = {
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  never: null,
};

export interface ShareResult {
  shareToken: string;
  shareUrl: string;
  shareExpiresAt: Date | null;
}

async function toggleShare(
  itineraryId: string,
  userId: string,
  isPublic: boolean,
  expiresIn: ExpiresIn = "7d",
): Promise<ShareResult | null> {
  const itinerary = await ItineraryModel.findOne({
    _id: itineraryId,
    userId,
  });
  if (!itinerary) {
    throw new AppError("Itinerary not found.", 404);
  }

  if (!isPublic) {
    await ItineraryModel.findByIdAndUpdate(itineraryId, { isPublic: false });
    return null;
  }

  // Generate a token on first share; reuse it on subsequent calls
  // so any previously shared URLs keep working
  if (!itinerary.shareToken) {
    itinerary.shareToken = randomBytes(32).toString("hex");
  }

  const expiryMs = EXPIRY_MS[expiresIn];
  const shareExpiresAt = expiryMs ? new Date(Date.now() + expiryMs) : undefined;

  itinerary.isPublic = true;
  itinerary.shareExpiresAt = shareExpiresAt;
  await itinerary.save();

  // shareToken is guaranteed to be set at this point
  const token = itinerary.shareToken as string;

  return {
    shareToken: token,
    shareUrl: `${env.CLIENT_URL}/share/${token}`,
    shareExpiresAt: shareExpiresAt ?? null,
  };
}

async function getPublicItinerary(token: string): Promise<IItineraryDocument> {
  const itinerary = await ItineraryModel.findOne({
    shareToken: token,
    isPublic: true,
  });

  if (!itinerary) {
    throw new AppError(
      "This itinerary is no longer available or the link is invalid.",
      404,
    );
  }

  if (itinerary.shareExpiresAt && itinerary.shareExpiresAt < new Date()) {
    throw new AppError(
      "This share link has expired. Ask the owner to generate a new one.",
      410,
    );
  }

  return itinerary;
}
export const shareService = {
  toggleShare,
  getPublicItinerary,
};
