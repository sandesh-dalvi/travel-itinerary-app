//  Builds the Gemini prompt for extracting structured data from booking text.

import { ParsedBookingData } from "../types";

//  The prompt is strict about JSON-only output to avoid having to parse markdown.
export const buildExtractionPrompt = (rawText: string): string => `
You are a travel booking data extractor. Extract structured information from the following booking document.

Return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Use this exact structure (omit fields that aren't present in the document):
{
  "type": "flight" | "hotel" | "train" | "bus" | "ferry" | "car_rental" | "other",
  "from": "departure city or location",
  "to": "destination city or location",
  "departureDate": "YYYY-MM-DD",
  "departureTime": "HH:MM",
  "arrivalDate": "YYYY-MM-DD",
  "arrivalTime": "HH:MM",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "confirmationNumber": "booking/PNR/confirmation number",
  "passengerName": "primary passenger or guest name",
  "airline": "airline name if flight",
  "flightNumber": "e.g. AI202",
  "trainNumber": "train number if applicable",
  "hotelName": "hotel name if applicable",
  "address": "full address if available",
  "roomType": "room type if hotel",
  "amenities": ["list", "of", "amenities"],
  "notes": "any other relevant booking details"
}

Booking document:
${rawText}
`;

// Builds the Gemini prompt for generating a full itinerary from multiple
export const buildItineraryPrompt = (bookings: ParsedBookingData[]): string => `
You are an expert travel planner. Based on the following travel bookings, create a comprehensive day-by-day travel itinerary.

Return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Bookings data:
${JSON.stringify(bookings, null, 2)}

Use this exact structure:
{
  "title": "Trip to [Main Destination]",
  "destination": "primary destination city/country",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "summary": "2-3 sentence overview of the trip",
  "travelTips": ["practical tip 1", "practical tip 2", "practical tip 3"],
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "Short evocative title e.g. Arrival in Rome",
      "activities": [
        {
          "time": "HH:MM",
          "type": "travel" | "accommodation" | "sightseeing" | "dining" | "leisure" | "other",
          "title": "Activity name",
          "description": "2-3 sentence description with helpful context",
          "location": "Specific place name or address",
          "duration": "e.g. 2 hours"
        }
      ]
    }
  ]
}

Fill in realistic sightseeing, dining, and leisure suggestions between the confirmed bookings.
`;
