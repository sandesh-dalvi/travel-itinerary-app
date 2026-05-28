import bcrypt from "bcryptjs";

import User, { IUserDocument } from "../models/User.model";
import { signRefreshToken, verifyRefreshToken } from "../utils/jwt.utils";
import { signAccessToken } from "../utils/jwt.utils";

import { AppError } from "../utils/AppError";

// Shape returned from login and register — used by the controller
export interface AuthResult {
  user: Pick<IUserDocument, "_id" | "name" | "email" | "createdAt">;
  accessToken: string;
  refreshToken: string;
}

// Register new user
async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  // check for existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({ name, email, password });

  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  //   Store hashed refresh token
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
}

// Login existing user
async function login(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Rotates the refresh token:
 * 1. Verifies the incoming refresh token (signature + expiry)
 * 2. Checks it matches the stored hash (prevents token reuse after logout)
 * 3. Issues a new access token + new refresh token (rotation)
 */
async function refreshAccessToken(
  incomingRefreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user || !user.refreshToken) {
    throw new AppError("Session not found.", 401);
  }

  const isTokenValid = await bcrypt.compare(
    incomingRefreshToken,
    user.refreshToken,
  );
  if (!isTokenValid) {
    // Token reuse detected — invalidate all existing tokens by clearing the stored hash
    user.refreshToken = undefined;
    await user.save();
    throw new AppError("Invalid refresh token", 401);
  }

  const payload = { userId: user._id.toString(), email: user.email };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/** Invalidates the user's refresh token on logout */
async function logout(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
}

async function getMe(userId: string) {
  const user = await User.findById(userId).select("-refreshToken").lean();

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
}

export const authService = {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
};
