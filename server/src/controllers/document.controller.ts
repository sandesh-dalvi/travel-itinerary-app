import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { documentService } from "../services/document.service";
import { successResponse } from "../utils/response.utils";
import { GetDocumentsQuery } from "../schemas/document.schema";

// upload document
async function upload(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const document = await documentService.uploadProcess(
    req.file,
    req.user!.userId,
  );

  res
    .status(201)
    .json(successResponse("Document uploaded successfully", { document }));
}

// get all documents
async function getAll(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as GetDocumentsQuery;

  const result = await documentService.getUserDocuments(req.user!.userId, {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
  });

  res.status(200).json(successResponse("Documents fetched.", result));
}

// get one document
async function getOne(req: Request, res: Response): Promise<void> {
  const document = await documentService.getDocumentById(
    req.params.id as string,
    req.user!.userId,
  );

  res.status(200).json(successResponse("Document fetched.", { document }));
}

// delete document
async function remove(req: Request, res: Response): Promise<void> {
  await documentService.deleteDocument(
    req.params.id as string,
    req.user!.userId,
  );
  res.status(200).json(successResponse("Document deleted successfully."));
}

export const documentController = {
  upload,
  getAll,
  getOne,
  remove,
};
