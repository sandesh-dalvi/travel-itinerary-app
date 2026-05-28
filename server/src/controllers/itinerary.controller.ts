// POST /api/itineraries/generate

import { Request, Response } from "express";
import {
  GenerateItineraryInput,
  ShareItineraryInput,
} from "../schemas/itinerary.schema";
import { successResponse } from "../utils/response.utils";
import { itineraryService } from "../services/itinerary.service";
import { shareService } from "../services/share.service";

// full AI generation pipeline and returns the saved itinerary.
async function generate(req: Request, res: Response): Promise<void> {
  const { documentIds } = req.body as GenerateItineraryInput;

  const itinerary = await itineraryService.generateItinerary(
    documentIds,
    req.user!.userId,
  );

  res
    .status(201)
    .json(successResponse("Itinerary generated successfully", { itinerary }));
}

// get all itineraries for the authenticated user
async function getAll(req: Request, res: Response): Promise<void> {
  const itineraries = await itineraryService.getUserItineraries(
    req.user!.userId,
  );
  res
    .status(200)
    .json(successResponse("Itineraries fetched.", { itineraries }));
}

// get one itinerary by ID
async function getOne(req: Request, res: Response): Promise<void> {
  const itinerary = await itineraryService.getById(
    req.params.id as string,
    req.user!.userId,
  );
  res.status(200).json(successResponse("Itinerary fetched.", { itinerary }));
}

// delete one itinerary by ID
async function remove(req: Request, res: Response): Promise<void> {
  await itineraryService.deleteItinerary(
    req.params.id as string,
    req.user!.userId,
  );
  res.status(200).json(successResponse("Itinerary deleted."));
}

// POST /api/itineraries/:id/share
// share one itinerary by ID with another user
async function share(req: Request, res: Response): Promise<void> {
  const { isPublic, expiresIn } = req.body as ShareItineraryInput;

  const result = await shareService.toggleShare(
    req.params.id as string,
    req.user!.userId,
    isPublic,
    expiresIn,
  );

  if (!isPublic || !result) {
    res.status(200).json(successResponse("Itinerary is now private."));
    return;
  }

  res.status(200).json(
    successResponse("Share link generated.", {
      shareToken: result.shareToken,
      shareUrl: result.shareUrl,
      shareExpiresAt: result.shareExpiresAt,
    }),
  );
}

// GET /api/share/:token
// Returns a shared itinerary if the token is valid and not expired.
export const getPublicItinerary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const itinerary = await shareService.getPublicItinerary(
    req.params.token as string,
  );
  res.status(200).json(successResponse("Itinerary fetched.", { itinerary }));
};

export const itineraryController = { generate, getAll, getOne, remove, share };
