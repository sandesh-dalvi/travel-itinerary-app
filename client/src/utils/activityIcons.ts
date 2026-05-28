import {
  Plane,
  Hotel,
  Camera,
  UtensilsCrossed,
  Palmtree,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityType } from "@/types";

interface ActivityStyle {
  Icon: LucideIcon;
  /** Tailwind classes for the icon wrapper background and icon color */
  className: string;
  label: string;
}

const ACTIVITY_STYLES: Record<ActivityType, ActivityStyle> = {
  travel: {
    Icon: Plane,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    label: "Travel",
  },
  accommodation: {
    Icon: Hotel,
    className:
      "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    label: "Accommodation",
  },
  sightseeing: {
    Icon: Camera,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    label: "Sightseeing",
  },
  dining: {
    Icon: UtensilsCrossed,
    className: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    label: "Dining",
  },
  leisure: {
    Icon: Palmtree,
    className:
      "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    label: "Leisure",
  },
  other: {
    Icon: MoreHorizontal,
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    label: "Other",
  },
};

export const getActivityStyle = (type: ActivityType): ActivityStyle => {
  return ACTIVITY_STYLES[type] ?? ACTIVITY_STYLES.other;
};
