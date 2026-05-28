import type { ApiResponse } from "../types";

/** Builds a typed success response object */
export const successResponse = <T>(
  message: string,
  data?: T,
): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

/** Builds a typed error response object */
export const errorResponse = (
  message: string,
  errors?: string[],
): ApiResponse => ({
  success: false,
  message,
  ...(errors && { errors }),
});
