import Groq from "groq-sdk";
import { env } from "./env";

/**
 * Shared Groq client instance.
 *
 * Models used in this project:
 *
 *   llama-3.3-70b-versatile  — text-only tasks (extraction from PDF text,
 *                              itinerary generation). Large context window,
 *                              excellent at following strict JSON output prompts.
 *
 *   meta-llama/llama-4-scout-17b-16e-instruct — vision-capable model used
 *                              when the uploaded document is an image.
 *                              Accepts base64 image data inline.
 *
 * Both are available on Groq's free tier as of 2025.
 */
export const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";
export const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
