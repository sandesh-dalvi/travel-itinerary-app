import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/** Messages that cycle during the Gemini generation wait (typically 5–15 seconds) */
const MESSAGES = [
  "Reading your booking documents...",
  "Identifying flights and hotels...",
  "Planning your travel timeline...",
  "Adding local sightseeing suggestions...",
  "Crafting dining recommendations...",
  "Polishing your day-by-day schedule...",
  "Adding helpful travel tips...",
  "Almost done...",
];

const INTERVAL_MS = 2200;

/**
 * Full-page loading state shown while Gemini generates the itinerary.
 * Cycles through descriptive messages so the wait feels purposeful, not frozen.
 */
export const GeneratingState = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8">
      {/* Animated icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-20 w-20 rounded-full bg-primary/10 animate-ping" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Generating your itinerary</h2>
        <p
          key={messageIndex} // Key change triggers a CSS transition on re-mount
          className="text-muted-foreground transition-opacity duration-500"
        >
          {MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[progress_8s_ease-in-out_infinite]" />
      </div>

      <p className="text-xs text-muted-foreground">
        This usually takes 10–20 seconds
      </p>

      <style>{`
        @keyframes progress {
          0%   { width: 5%; }
          50%  { width: 80%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  );
};
