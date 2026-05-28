import { useQuery } from "@tanstack/react-query";
import { itineraryApi } from "@/api/itinerary.api";

/**
 * Polls the itinerary endpoint at a fixed interval while the status is 'processing'.
 * Designed for async generation flows where the server queues work in the background.
 *
 * In this implementation, generation is synchronous, so this hook is primarily
 * useful as a safety net — e.g. if a request times out and the itinerary was
 * generated server-side but the response was lost.
 */
export const useItineraryStatus = (
  itineraryId: string | undefined,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["itinerary", itineraryId],
    queryFn: () => itineraryApi.getById(itineraryId!),
    select: (res) => res.data?.itinerary,
    enabled: Boolean(itineraryId) && enabled,
    refetchInterval: (query) => {
      // Stop polling once the itinerary is fully loaded
      return query.state.data?.data?.itinerary ? false : 3000;
    },
    refetchIntervalInBackground: false,
  });
};
