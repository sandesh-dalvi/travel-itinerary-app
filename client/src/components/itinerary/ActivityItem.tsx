import { MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getActivityStyle } from "@/utils/activityIcons";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types";

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

/**
 * Single activity row in the day timeline.
 * Uses a vertical connector line to visually link activities within a day.
 */
export const ActivityItem = ({
  activity,
  isLast = false,
}: ActivityItemProps) => {
  const { Icon, className, label } = getActivityStyle(activity.type);

  return (
    <div className="flex gap-4">
      {/* Timeline track — icon + vertical line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full shrink-0",
            className,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        {/* Vertical connector — hidden on the last item */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border mt-1 mb-1 min-h-5" />
        )}
      </div>

      {/* Activity content */}
      <div className={cn("pb-5 flex-1 min-w-0", isLast && "pb-0")}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="space-y-0.5">
            <h4 className="font-medium text-sm leading-snug">
              {activity.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {activity.time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </span>
              )}
              {activity.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-50">{activity.location}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activity.duration && (
              <Badge variant="outline" className="text-xs font-normal">
                {activity.duration}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="text-xs font-normal capitalize"
            >
              {label}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {activity.description}
        </p>
      </div>
    </div>
  );
};
