import { useMutation, useQuery } from "@tanstack/react-query";
import type { CVFormData } from "../schemas/cv.schema";
import { DraftCV } from "../db/schema";

export const cvKeys = {
  all: ["cvs"] as const,
  list: () => [...cvKeys.all, "list"] as const,
  drafts: () => [...cvKeys.all, "drafts"] as const,
  draft: (id: string) => [...cvKeys.drafts(), id] as const,
  completed: () => [...cvKeys.all, "completed"] as const,
};

export function useBuiltCVs() {
  return useQuery<{ success: boolean; data: unknown[] }>({
    queryKey: cvKeys.list(),
    queryFn: async () => {
      const response = await fetch("/api/cv/list");
      if (!response.ok) {
        throw new Error("Failed to fetch CVs");
      }
      return response.json();
    },
  });
}

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

// Hook for standalone CVs (not linked to any job seeker)
export function useStandaloneCVs() {
  const query = useBuiltCVs();
  const data = query.data?.data ?? [];
  const standalone = (
    data as Array<{ sourceJobSeekerId?: string | null }>
  ).filter((cv) => cv.sourceJobSeekerId == null || cv.sourceJobSeekerId === "");
  return { ...query, data: standalone, allData: data };
}
