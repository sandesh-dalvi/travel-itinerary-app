import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ActivityItem } from "./ActivityItem";
import { formatDate } from "@/utils/formatDate";
import type { ItineraryDay } from "@/types";

interface DayTimelineProps {
  days: ItineraryDay[];
}

/**
 * Accordion-based day-by-day itinerary view.
 * All days are expanded by default so the user sees the full trip at a glance.
 * Each day can be collapsed independently to reduce visual noise on long trips.
 */
export const DayTimeline = ({ days }: DayTimelineProps) => {
  // Expand all days by default
  const defaultOpenValues = days.map((d) => `day-${d.dayNumber}`);

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpenValues}
      className="space-y-3"
    >
      {days.map((day) => (
        <AccordionItem
          key={day.dayNumber}
          value={`day-${day.dayNumber}`}
          className="border rounded-xl overflow-hidden print-day-section"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/40 transition-colors data-[state=open]:bg-muted/40">
            <div className="flex items-center gap-3 text-left">
              {/* Day badge */}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {day.dayNumber}
              </span>

              <div>
                <p className="font-medium text-sm">{day.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(day.date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              {/* Activity count badge */}
              <Badge
                variant="secondary"
                className="ml-auto mr-2 text-xs font-normal"
              >
                {day.activities.length}{" "}
                {day.activities.length === 1 ? "activity" : "activities"}
              </Badge>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="px-5 pt-4 pb-2">
              {day.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No activities planned for this day.
                </p>
              ) : (
                day.activities.map((activity, index) => (
                  <ActivityItem
                    key={`${day.dayNumber}-${index}`}
                    activity={activity}
                    isLast={index === day.activities.length - 1}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
