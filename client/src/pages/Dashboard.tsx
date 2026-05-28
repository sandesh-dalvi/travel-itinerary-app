import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, MapPin, Calendar, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth.store";
import { itineraryApi } from "@/api/itinerary.api";
import { formatDateRange, getNightCount } from "@/utils/formatDate";
import type { Itinerary } from "@/types";

/** Single itinerary card shown in the dashboard grid */
const ItineraryCard = ({
  itinerary,
  onDelete,
}: {
  itinerary: Itinerary;
  onDelete: (itinerary: Itinerary) => void;
}) => {
  const nightCount = getNightCount(itinerary.startDate, itinerary.endDate);

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow group">
      <Link
        to={`/itineraries/${itinerary._id}`}
        className="flex-1 flex flex-col"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {itinerary.title}
            </CardTitle>
            {itinerary.isPublic && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Shared
              </Badge>
            )}
          </div>
          <CardDescription className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{itinerary.destination}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatDateRange(itinerary.startDate, itinerary.endDate)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {nightCount} {nightCount === 1 ? "night" : "nights"} ·{" "}
            {itinerary.days.length}{" "}
            {itinerary.days.length === 1 ? "day" : "days"}
          </p>
          {itinerary.summary && (
            <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">
              {itinerary.summary}
            </p>
          )}
        </CardContent>
      </Link>

      <CardFooter className="pt-0 pb-3">
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7 text-xs text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.preventDefault(); // Prevent Link navigation
            onDelete(itinerary);
          }}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [itineraryToDelete, setItineraryToDelete] = useState<Itinerary | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["itineraries"],
    queryFn: () => itineraryApi.getAll(),
    select: (res) => res.data?.itineraries ?? [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itineraryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast.success("Itinerary deleted.");
      setItineraryToDelete(null);
    },
    onError: () => toast.error("Failed to delete itinerary."),
  });

  const itineraries = data ?? [];

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My itineraries</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}.
            </p>
          </div>
          <Button asChild>
            <Link to="/upload" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New trip
            </Link>
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && itineraries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-6 rounded-full bg-muted mb-6">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No itineraries yet</h2>
            <p className="text-muted-foreground max-w-sm mb-6 text-sm">
              Upload your flight tickets, hotel bookings, or any travel
              documents. AI will build your day-by-day itinerary automatically.
            </p>
            <Button asChild>
              <Link to="/upload">Upload your first booking</Link>
            </Button>
          </div>
        )}

        {/* Itinerary grid */}
        {!isLoading && itineraries.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary._id}
                itinerary={itinerary}
                onDelete={setItineraryToDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(itineraryToDelete)}
        onOpenChange={() => setItineraryToDelete(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete itinerary</DialogTitle>
            <DialogDescription>
              Permanently delete <strong>{itineraryToDelete?.title}</strong>?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItineraryToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (itineraryToDelete)
                  deleteMutation.mutate(itineraryToDelete._id);
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
