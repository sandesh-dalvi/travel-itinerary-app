import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { documentController } from "../controllers/document.controller";
import { upload } from "../middleware/upload.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  documentIdSchema,
  getDocumentsSchema,
} from "../schemas/document.schema";

const router = Router();

// all document routes with authentication middleware
router.use(authenticate);

//
router.post("/", upload.single("file"), documentController.upload); //upload document
router.get("/", validate(getDocumentsSchema), documentController.getAll); //get documents
router.get("/:id", validate(documentIdSchema), documentController.getOne); //get document by ID
router.delete("/:id", validate(documentIdSchema), documentController.remove); //delete document by ID

export default router;
