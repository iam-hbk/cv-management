import { useMutation, useQuery } from "@tanstack/react-query";
import type { CVFormData } from "@/schemas/cv.schema";
import { DraftCV } from "@/db/schema";

export const cvKeys = {
  all: ["cvs"] as const,
  drafts: () => [...cvKeys.all, "drafts"] as const,
  draft: (id: string) => [...cvKeys.drafts(), id] as const,
  completed: () => [...cvKeys.all, "completed"] as const,
};

export function useSaveDraftMutation() {
  return useMutation({
    mutationFn: async (data: DraftCV) => {
      const response = await fetch("/api/cv/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      return response.json();
    },
  });
}

export function useSubmitCVMutation() {
  return useMutation({
    mutationFn: async (data: CVFormData) => {
      const response = await fetch("/api/cv/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit CV");
      }

      return response.json();
    },
  });
}

export function useDrafts() {
  return useQuery({
    queryKey: cvKeys.drafts(),
    queryFn: async () => {
      const response = await fetch("/api/cv/drafts");
      if (!response.ok) {
        throw new Error("Failed to fetch drafts");
      }
      return response.json();
    },
  });
}
