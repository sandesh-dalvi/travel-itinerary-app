import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Share2,
  Printer,
  Trash2,
  ArrowLeft,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DayTimeline } from "@/components/itinerary/DayTimeline";
import { ShareModal } from "@/components/itinerary/ShareModal";
import { itineraryApi } from "@/api/itinerary.api";
import { formatDateRange, getNightCount } from "@/utils/formatDate";

/** Skeleton shown while the itinerary data loads */
const ItineraryDetailSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-20 w-full rounded-xl" />
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-32 w-full rounded-xl" />
    ))}
  </div>
);

const ItineraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["itinerary", id],
    queryFn: () => itineraryApi.getById(id!),
    select: (res) => res.data?.itinerary,
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => itineraryApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast.success("Itinerary deleted.");
      navigate("/dashboard", { replace: true });
    },
    onError: () => toast.error("Failed to delete itinerary."),
  });

  const handlePrint = () => window.print();

  if (isLoading) return <ItineraryDetailSkeleton />;

  if (isError || !data) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">
          Itinerary not found or you don't have access.
        </p>
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const nightCount = getNightCount(data.startDate, data.endDate);

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-8 print-container">
        {/* Back button — hidden on print */}
        <div className="no-print">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/dashboard" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              My itineraries
            </Link>
          </Button>
        </div>

        {/* ── Hero section ── */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold leading-tight">
              {data.title}
            </h1>
            {data.isPublic && (
              <Badge variant="secondary" className="shrink-0">
                Shared
              </Badge>
            )}
          </div>

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
              {nightCount} {nightCount === 1 ? "night" : "nights"}
            </span>
          </div>

          {/* Action bar — hidden on print */}
          <div className="flex items-center gap-2 pt-1 no-print">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareOpen(true)}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print / PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2 text-destructive hover:text-destructive ml-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Separator />

        {/* ── Trip summary ── */}
        {data.summary && (
          <div className="rounded-xl bg-muted/40 border px-5 py-4">
            <p className="text-sm leading-relaxed text-foreground">
              {data.summary}
            </p>
          </div>
        )}

        {/* ── Day-by-day timeline ── */}
        <section>
          <h2 className="text-base font-semibold mb-4">
            Your itinerary · {data.days.length}{" "}
            {data.days.length === 1 ? "day" : "days"}
          </h2>
          <DayTimeline days={data.days} />
        </section>

        {/* ── Travel tips ── */}
        {data.travelTips?.length > 0 && (
          <section className="print-day-section">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Travel tips
            </h2>
            <ul className="space-y-2">
              {data.travelTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm">
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
      </div>

      {/* ── Share modal ── */}
      <ShareModal
        itinerary={data}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete itinerary</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{data.title}</strong>. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItineraryDetail;
