/**
 * Frontend type definitions — mirror the backend API response shapes.
 * Keeping types in sync with the backend prevents runtime shape mismatches.
 */

// Auth
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Documents
export type DocumentStatus = "processing" | "done" | "failed";
export type FileType = "pdf" | "image";
export type BookingType =
  | "flight"
  | "hotel"
  | "train"
  | "bus"
  | "ferry"
  | "car_rental"
  | "other";

export interface ParsedBookingData {
  type: BookingType;
  from?: string;
  to?: string;
  departureDate?: string;
  departureTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  checkIn?: string;
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

export interface TravelDocument {
  _id: string;
  userId: string;
  fileName: string;
  fileType: FileType;
  fileUrl: string;
  parsedBookingData?: ParsedBookingData;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: string;
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
  time: string;
  type: ActivityType;
  title: string;
  description: string;
  location: string;
  duration?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  activities: Activity[];
}

export interface Itinerary {
  _id: string;
  userId: string;
  documentIds: string[];
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
  travelTips: string[];
  summary: string;
  shareToken?: string;
  isPublic: boolean;
  shareExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  documents: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
