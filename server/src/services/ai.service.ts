import { groq, GROQ_TEXT_MODEL, GROQ_VISION_MODEL } from "../config/groq";
import {
  buildExtractionPrompt,
  buildItineraryPrompt,
} from "../utils/prompt.utils";
import { AppError } from "../utils/AppError";
import type { ParsedBookingData, GeneratedItinerary } from "../types";

/**
 * Groq returns clean JSON reliably when the prompt is strict, but defensively
 * strip any markdown fences it might add and parse safely.
 */
const parseGroqJSON = <T>(rawText: string): T => {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```$/im, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    console.error(
      "[ai.service] Failed to parse Groq response:",
      cleaned.substring(0, 300),
    );
    throw new AppError(
      "The AI returned an unexpected format. Please try again.",
      502,
    );
  }
};

export const aiService = {
  /**
   * Extracts structured booking data from raw PDF text.
   * Uses the large 70B model — it follows strict JSON schemas reliably.
   */
  async extractFromText(rawText: string): Promise<ParsedBookingData> {
    const completion = await groq.chat.completions.create({
      model: GROQ_TEXT_MODEL,
      temperature: 0.1, // Near-zero temperature = deterministic JSON output
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are a travel booking data extractor. You output ONLY valid JSON — " +
            "no markdown, no explanation, no code fences. Never add text before or after the JSON object.",
        },
        {
          role: "user",
          content: buildExtractionPrompt(rawText),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "";
    return parseGroqJSON<ParsedBookingData>(text);
  },

  /**
   * Extracts structured booking data from an image (JPEG, PNG, WebP).
   *
   * Groq's vision model accepts base64 image data in the OpenAI image_url
   * format using a data URI. The extraction prompt is the same as text —
   * only the message content shape differs.
   */
  async extractFromImage(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<ParsedBookingData> {
    const base64Image = imageBuffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    const completion = await groq.chat.completions.create({
      model: GROQ_VISION_MODEL,
      temperature: 0.1,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are a travel booking data extractor. You output ONLY valid JSON — " +
            "no markdown, no explanation, no code fences.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUri },
            },
            {
              type: "text",
              text: buildExtractionPrompt(
                "Extract all booking details from the travel document image above.",
              ),
            },
          ],
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "";
    return parseGroqJSON<ParsedBookingData>(text);
  },

  /**
   * Generates a complete day-by-day itinerary from multiple parsed booking objects.
   *
   * The 70B model with a 32k context window handles even large multi-booking
   * prompts comfortably. Temperature stays low so the structure is consistent.
   */
  async generateItinerary(
    bookings: ParsedBookingData[],
  ): Promise<GeneratedItinerary> {
    const completion = await groq.chat.completions.create({
      model: GROQ_TEXT_MODEL,
      temperature: 0.4, // Slightly higher here — allows creative activity suggestions
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content:
            "You are an expert travel planner. You output ONLY valid JSON — " +
            "no markdown, no explanation, no code fences. " +
            "Create detailed, realistic itineraries with specific local recommendations.",
        },
        {
          role: "user",
          content: buildItineraryPrompt(bookings),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? "";
    return parseGroqJSON<GeneratedItinerary>(text);
  },
};
