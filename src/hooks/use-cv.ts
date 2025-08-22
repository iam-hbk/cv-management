import { useQuery } from "@tanstack/react-query";
import { getCVById } from "@/lib/cv";

type CVResponse = Awaited<ReturnType<typeof getCVById>>;

export function useCV(id: string) {
  return useQuery<CVResponse>({
    queryKey: ["cv", id],
    queryFn: async () => {
      
      const response = await fetch(`/api/cv/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("CV not found");
        }
        throw new Error("Failed to fetch CV");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id, // Only run query if id exists
  });
}
