import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { itineraryApi } from "@/api/itinerary.api";

type ExpiresIn = "7d" | "30d" | "never";

/**
 * Manages all share-link state for a single itinerary.
 * Wraps the API call, clipboard copy, and query invalidation in one hook.
 */
export const useShare = (itineraryId: string) => {
  const queryClient = useQueryClient();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const shareMutation = useMutation({
    mutationFn: ({
      isPublic,
      expiresIn,
    }: {
      isPublic: boolean;
      expiresIn?: ExpiresIn;
    }) => itineraryApi.share(itineraryId, { isPublic, expiresIn }),

    onSuccess: (res, variables) => {
      if (variables.isPublic && res.data) {
        setShareUrl(res.data.shareUrl);
        setShareExpiresAt(res.data.shareExpiresAt ?? null);
        toast.success("Share link created. Copy it below.");
      } else {
        setShareUrl(null);
        setShareExpiresAt(null);
        toast.success("Itinerary is now private.");
      }
      // Update the itinerary in the cache so the "Shared" badge reflects immediately
      queryClient.invalidateQueries({ queryKey: ["itinerary", itineraryId] });
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },

    onError: () => {
      toast.error("Failed to update sharing settings. Please try again.");
    },
  });

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Could not copy — please copy the link manually.");
    }
  };

  return {
    shareUrl,
    shareExpiresAt,
    isCopied,
    isLoading: shareMutation.isPending,
    enableSharing: (expiresIn: ExpiresIn = "7d") =>
      shareMutation.mutate({ isPublic: true, expiresIn }),
    disableSharing: () => shareMutation.mutate({ isPublic: false }),
    copyToClipboard,
  };
};
