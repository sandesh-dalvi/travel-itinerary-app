/**
 * Shared TypeScript interfaces used across the application.
 */

export type BookingType =
  | "flight"
  | "hotel"
  | "train"
  | "bus"
  | "ferry"
  | "car_rental"
  | "other";

/**
 * Structured data extracted by Gemini from an uploaded booking document.
 * All fields are optional since different booking types contain different info.
 */

export interface ParsedBookingData {
  type: BookingType;
  from?: string;
  to?: string;
  departureDate?: string; // ISO date: YYYY-MM-DD
  departureTime?: string; // HH:MM
  arrivalDate?: string;
  arrivalTime?: string;
  checkIn?: string; // For hotels: ISO date
  checkOut?: string;
  confirmationNumber?: string;
  passengerName?: string;
  airline?: string;
  flightNumber?: string;
  trainNumber?: string;
  hotelName?: string;
  address?: string;
  roomType?: string;
  amenities?: string[];
  notes?: string;
}

// Itinerary
export type ActivityType =
  | "travel"
  | "accommodation"
  | "sightseeing"
  | "dining"
  | "leisure"
  | "other";

export interface Activity {
  time: string; // e.g. "09:00"
  type: ActivityType;
  title: string;
  description: string;
  location: string;
  duration?: string; // e.g. "2 hours"
}

export interface ItineraryDay {
  dayNumber: number;
  date: string; // ISO date: YYYY-MM-DD
  title: string; // e.g. "Arrival in Paris"
  activities: Activity[];
}

export interface GeneratedItinerary {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
  travelTips: string[];
  summary: string;
}

// Document
export type DocumentStatus = "processing" | "done" | "failed";
export type FileType = "pdf" | "image";

// API Response
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
