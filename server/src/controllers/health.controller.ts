import { Request, Response } from "express";

export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "Server is healthy and running",
    timestamp: new Date().toISOString(),
  });
};
