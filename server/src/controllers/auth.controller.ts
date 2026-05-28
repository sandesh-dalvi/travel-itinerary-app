/**
 * Controllers are intentionally thin — they only:
 *  1. Extract validated data from the request
 *  2. Call the service
 *  3. Send the response
 *
 * All business logic and error throwing lives in the service layer.
 * Express 5 catches async errors automatically — no try/catch needed here.
 */
import { Request, Response } from "express";

import { LoginInput, RegisterInput } from "../schemas/auth.schema";
import { authService } from "../services/auth.service";

import { refreshTokenCookieOptions } from "../utils/jwt.utils";
import { successResponse } from "../utils/response.utils";
import { AppError } from "../utils/AppError";
import User from "../models/User.model";

async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as RegisterInput;

  const { user, accessToken, refreshToken } = await authService.register(
    name,
    email,
    password,
  );

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res
    .status(201)
    .json(successResponse("Registration Successful", { user, accessToken }));
}

async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;

  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password,
  );

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res
    .status(200)
    .json(successResponse("Login Successful", { user, accessToken }));
}

async function refresh(req: Request, res: Response): Promise<void> {
  const incomingToken = req.cookies?.refreshToken as string | undefined;

  if (!incomingToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const { accessToken, refreshToken } =
    await authService.refreshAccessToken(incomingToken);

  // Rotate the refresh token in the cookie
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json(successResponse("Token refreshed", { accessToken }));
}

// logout
async function logout(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  await authService.logout(userId);

  res.clearCookie("refreshToken");
  res.status(200).json(successResponse("Logged out successfully."));
}

async function getMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const user = await authService.getMe(userId);

  res.status(200).json(successResponse("User fetched.", { user }));
}

export const authController = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
