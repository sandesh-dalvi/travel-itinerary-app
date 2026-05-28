import { AppError } from "../utils/AppError";
import ItineraryModel, { IItineraryDocument } from "../models/Itinerary.model";
import { env } from "../config/env";
import { randomBytes } from "crypto";

type ExpiresIn = "7d" | "30d" | "never";

const EXPIRY_MS: Record<ExpiresIn, number | null> = {
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  never: null,
};

/**
 * Enables or disables public sharing for an itinerary.
 *
 * When enabling:
 *   - A share token is generated on first-enable (and reused on subsequent calls)
 *   - An optional expiry window is set on the token
 *
 * When disabling:
 *   - isPublic is set to false — the token is retained so it can be re-enabled
 *     without changing the URL (prevents broken links shared with others)
 */

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

  // Generate a cryptographically secure token on first share
  // Reuse the existing token so the URL stays stable for anyone who already has it
  if (!itinerary.shareToken) {
    itinerary.shareToken = randomBytes(32).toString("hex");
  }

  const expiryMs = EXPIRY_MS[expiresIn];
  const shareExpiresAt = expiryMs ? new Date(Date.now() + expiryMs) : undefined;

  itinerary.isPublic = true;
  itinerary.shareExpiresAt = shareExpiresAt;
  await itinerary.save();

  return {
    shareToken: itinerary.shareToken,
    shareUrl: `${env.CLIENT_URL}/share/${itinerary.shareToken}`,
    shareExpiresAt: shareExpiresAt ?? null,
  };
}

export interface ShareResult {
  shareToken: string;
  shareUrl: string;
  shareExpiresAt: Date | null;
}

/**
 * Fetches a publicly shared itinerary by its share token.
 * Validates that:
 *   - The itinerary exists and has sharing enabled
 *   - The share link has not expired
 */
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
