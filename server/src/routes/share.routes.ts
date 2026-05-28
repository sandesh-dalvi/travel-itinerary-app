import { Router } from "express";
import { getPublicItinerary } from "../controllers/itinerary.controller";
import { validate } from "../middleware/validate.middleware";
import { shareTokenSchema } from "../schemas/itinerary.schema";

const router = Router();

// Fully public — no auth middleware
router.get("/:token", validate(shareTokenSchema), getPublicItinerary);

export default router;
