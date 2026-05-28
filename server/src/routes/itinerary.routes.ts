import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  generateItinerarySchema,
  itineraryIdSchema,
  shareItinerarySchema,
} from "../schemas/itinerary.schema";
import { itineraryController } from "../controllers/itinerary.controller";

const router = Router();

router.use(authenticate);

router.post(
  "/generate",
  validate(generateItinerarySchema),
  itineraryController.generate,
);
router.get("/", itineraryController.getAll);
router.get("/:id", validate(itineraryIdSchema), itineraryController.getOne);
router.delete("/:id", validate(itineraryIdSchema), itineraryController.remove);
router.post(
  "/:id/share",
  validate(shareItinerarySchema),
  itineraryController.share,
);

export default router;
