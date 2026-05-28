import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Plane, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DayTimeline } from "@/components/itinerary/DayTimeline";
import { itineraryApi } from "@/api/itinerary.api";
import { formatDateRange, getNightCount } from "@/utils/formatDate";
import { Lightbulb } from "lucide-react";

/** Minimal navbar shown only on the public share page */
const PublicNavbar = () => (
  <header className="border-b bg-background/95 backdrop-blur">
    <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-4xl">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <Plane className="h-4 w-4 text-primary" />
        <span>TripCraft</span>
      </Link>
      <Button size="sm" asChild>
        <Link to="/register">Create your own</Link>
      </Button>
    </div>
  </header>
);

const SharedItinerarySkeleton = () => (
  <div className="space-y-6 max-w-3xl mx-auto py-8">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-20 w-full rounded-xl" />
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-32 w-full rounded-xl" />
    ))}
  </div>
);

const PublicShare = () => {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public-itinerary", token],
    queryFn: () => itineraryApi.getPublic(token!),
    select: (res) => res.data?.itinerary,
    enabled: Boolean(token),
    retry: false, // Don't retry 404s or 410s — show error immediately
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        {isLoading && <SharedItinerarySkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Itinerary not available</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                {(error as any)?.response?.data?.message ??
                  "This link may have expired or been made private by the owner."}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/register">Create your own itinerary →</Link>
            </Button>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              {/* "Shared by" label */}
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Shared itinerary
              </p>

              <h1 className="text-2xl font-semibold leading-tight">
                {data.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {data.destination}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDateRange(data.startDate, data.endDate)}
                </span>
                <span>
                  {getNightCount(data.startDate, data.endDate)} nights ·{" "}
                  {data.days.length} days
                </span>
              </div>
            </div>

            <Separator />

            {/* Summary */}
            {data.summary && (
              <div className="rounded-xl bg-muted/40 border px-5 py-4">
                <p className="text-sm leading-relaxed">{data.summary}</p>
              </div>
            )}

            {/* Day timeline */}
            <section>
              <h2 className="text-base font-semibold mb-4">
                Day-by-day itinerary
              </h2>
              <DayTimeline days={data.days} />
            </section>

            {/* Travel tips */}
            {data.travelTips?.length > 0 && (
              <section>
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Travel tips
                </h2>
                <ul className="space-y-2">
                  {data.travelTips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Separator />

            {/* CTA banner */}
            <div className="rounded-xl border bg-primary/5 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-semibold flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Build your own AI itinerary
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Upload your booking documents and get a plan like this in
                  seconds.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link to="/register">Get started — it's free</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        Powered by{" "}
        <Link to="/" className="text-primary hover:underline">
          TripCraft
        </Link>{" "}
        · AI-powered travel planning
      </footer>
    </div>
  );
};

export default PublicShare;
