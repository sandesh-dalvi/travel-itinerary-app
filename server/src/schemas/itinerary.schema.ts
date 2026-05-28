import { z } from "zod";

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const generateItinerarySchema = z.object({
  body: z.object({
    documentIds: z
      .array(z.string().regex(mongoIdRegex, "Invalid document ID format"))
      .min(1, "At least one document is required")
      .max(10, "A maximum of 10 documents can be used per itinerary"),
  }),
});

export const itineraryIdSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, "Invalid itinerary ID"),
  }),
});

export const shareItinerarySchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, "Invalid itinerary ID"),
  }),
  body: z.object({
    isPublic: z.boolean().default(true),
    /**
     * How long the share link should remain active.
     * 'never' means no expiry — the link works until manually disabled.
     */
    expiresIn: z.enum(["7d", "30d", "never"]).default("7d"),
  }),
});

export const shareTokenSchema = z.object({
  params: z.object({
    token: z.string().min(1, "Share token is required"),
  }),
});

export type GenerateItineraryInput = z.infer<
  typeof generateItinerarySchema
>["body"];
export type ShareItineraryInput = z.infer<typeof shareItinerarySchema>["body"];
