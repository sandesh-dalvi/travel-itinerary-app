import { useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Image,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GeneratingState } from "@/components/itinerary/GeneratingState";
import { documentApi } from "@/api/document.api";
import { itineraryApi } from "@/api/itinerary.api";
import type { TravelDocument } from "@/types";

const BOOKING_TYPE_LABELS: Record<string, string> = {
  flight: "✈️ Flight",
  hotel: "🏨 Hotel",
  train: "🚂 Train",
  bus: "🚌 Bus",
  ferry: "⛴️ Ferry",
  car_rental: "🚗 Car Rental",
  other: "📄 Other",
};

/** Summary card for a single document shown on the confirm-before-generate screen */
const DocumentPreviewCard = ({ doc }: { doc: TravelDocument }) => {
  const booking = doc.parsedBookingData;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
      {doc.fileType === "pdf" ? (
        <FileText className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
      ) : (
        <Image className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{doc.fileName}</p>
          {booking && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {BOOKING_TYPE_LABELS[booking.type] ?? booking.type}
            </Badge>
          )}
        </div>

        {booking && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {booking.from && booking.to && `${booking.from} → ${booking.to}`}
            {booking.hotelName && booking.hotelName}
            {(booking.departureDate || booking.checkIn) && (
              <span className="ml-2">
                · {booking.departureDate ?? booking.checkIn}
                {(booking.arrivalDate || booking.checkOut) &&
                  ` – ${booking.arrivalDate ?? booking.checkOut}`}
              </span>
            )}
          </p>
        )}
      </div>

      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
    </div>
  );
};

const Generate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // documentIds passed from the Upload page as comma-separated query param
  const documentIds = useMemo(() => {
    const raw = searchParams.get("documentIds") ?? "";
    return raw.split(",").filter(Boolean);
  }, [searchParams]);

  // Fetch all documents (cached from Upload page) and filter to selected ones
  const { data: allDocsData, isLoading: isLoadingDocs } = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentApi.getAll(),
    select: (res) => res.data?.documents ?? [],
  });

  const selectedDocs = useMemo(
    () => (allDocsData ?? []).filter((d) => documentIds.includes(d._id)),
    [allDocsData, documentIds],
  );

  const readyDocs = selectedDocs.filter((d) => d.status === "done");
  const failedDocs = selectedDocs.filter((d) => d.status === "failed");

  const generateMutation = useMutation({
    mutationFn: () => itineraryApi.generate(readyDocs.map((d) => d._id)),
    onSuccess: (res) => {
      if (res.data?.itinerary) {
        toast.success("Itinerary created!");
        navigate(`/itineraries/${res.data.itinerary._id}`, { replace: true });
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ??
        "Generation failed. Please check your documents and try again.";
      toast.error(message);
    },
  });

  // Show full-screen generating state while Gemini works
  if (generateMutation.isPending) {
    return (
      <div className="max-w-lg mx-auto">
        <GeneratingState />
      </div>
    );
  }

  // Guard: redirect if no valid document IDs in the URL
  if (!isLoadingDocs && documentIds.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-lg font-semibold">No documents selected</h2>
        <p className="text-muted-foreground text-sm">
          Go back to the upload page and select documents to generate an
          itinerary.
        </p>
        <Button asChild>
          <Link to="/upload">Back to upload</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link to="/upload" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to upload
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Review &amp; generate</h1>
        <p className="text-muted-foreground mt-1">
          Confirm the documents below, then let AI build your itinerary.
        </p>
      </div>

      {/* Document review card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Selected booking documents
          </CardTitle>
          <CardDescription>
            {readyDocs.length} document{readyDocs.length !== 1 ? "s" : ""} ready
            for generation
            {failedDocs.length > 0 &&
              ` · ${failedDocs.length} will be skipped (processing failed)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoadingDocs ? (
            <p className="text-sm text-muted-foreground">
              Loading documents...
            </p>
          ) : (
            readyDocs.map((doc) => (
              <DocumentPreviewCard key={doc._id} doc={doc} />
            ))
          )}

          {failedDocs.length > 0 && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                The following documents failed to process and will be skipped:
              </p>
              {failedDocs.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm opacity-60"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doc.fileName}</span>
                  <Badge
                    variant="destructive"
                    className="ml-auto text-xs shrink-0"
                  >
                    Failed
                  </Badge>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* What AI will do */}
      <Card className="border-dashed">
        <CardContent className="pt-5">
          <p className="text-sm font-medium mb-3">What happens next</p>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>AI reads all your confirmed booking details</li>
            <li>
              It builds a day-by-day schedule based on your flights, hotels, and
              transfers
            </li>
            <li>
              It fills in realistic sightseeing, dining, and leisure suggestions
            </li>
            <li>You get a structured, shareable itinerary in seconds</li>
          </ol>
        </CardContent>
      </Card>

      {/* Generate CTA */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <Link to="/upload">Add more documents</Link>
        </Button>
        <Button
          size="lg"
          onClick={() => generateMutation.mutate()}
          disabled={readyDocs.length === 0 || generateMutation.isPending}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate itinerary
        </Button>
      </div>
    </div>
  );
};

export default Generate;
