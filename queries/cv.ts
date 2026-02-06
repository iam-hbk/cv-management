import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import type { CVFormData } from "../convex/validators";

// CV type definition (local type for legacy compatibility)
export type DraftCV = {
	jobTitle: string;
	formData: CVFormData;
	sourceJobSeekerId?: string | null;
};

// Query keys for React Query (if still needed for cache management)
export const cvKeys = {
	all: ["cvs"] as const,
	list: () => [...cvKeys.all, "list"] as const,
	drafts: () => [...cvKeys.all, "drafts"] as const,
	draft: (id: string) => [...cvKeys.drafts(), id] as const,
	completed: () => [...cvKeys.all, "completed"] as const,
};

// Hook to get all CVs using Convex
export function useCVs() {
	return useQuery(api.cvs.getCVs);
}

// Hook to get a single CV by ID
export function useCV(id: string | null | undefined) {
	return useQuery(api.cvs.getCVById, id ? { id: id as Id<"cvs"> } : "skip");
}

// Hook to create a new draft
export function useCreateDraft() {
	return useMutation(api.cvs.createDraft);
}

// Hook to update a draft
export function useUpdateDraft() {
	return useMutation(api.cvs.updateDraft);
}

// Hook to submit a CV
export function useSubmitCV() {
	return useMutation(api.cvs.submitCV);
}

// Hook to create and submit in one action
export function useCreateAndSubmitCV() {
	return useMutation(api.cvs.createAndSubmit);
}

// Hook to delete a CV
export function useDeleteCV() {
	return useMutation(api.cvs.deleteCV);
}

// Type for CV data returned from queries
type CVData = NonNullable<ReturnType<typeof useCVs>>[number];

// Hook for standalone CVs (not linked to any job seeker)
export function useStandaloneCVs() {
	const cvs = useCVs();
	const data = cvs ?? [];
	const standalone = data.filter(
		(cv: CVData) => cv.sourceJobSeekerId == null || cv.sourceJobSeekerId === ""
	);
	return { data: standalone, allData: data, isLoading: cvs === undefined };
}

// Legacy hooks for backward compatibility (these use Convex under the hood)
export function useBuiltCVs() {
	const cvs = useCVs();
	return {
		data: { success: true, data: cvs ?? [] },
		isLoading: cvs === undefined,
	};
}

export function useSaveDraftMutation() {
	const createDraft = useCreateDraft();
	return {
		mutateAsync: async (data: DraftCV) => {
			const id = await createDraft({
				jobTitle: data.jobTitle,
				formData: data.formData,
				sourceJobSeekerId: data.sourceJobSeekerId ?? undefined,
			});
			return { id };
		},
	};
}

export function useSubmitCVMutation() {
	const createAndSubmit = useCreateAndSubmitCV();
	return {
		mutateAsync: async (
			data: CVFormData & {
				jobTitle?: string;
				sourceJobSeekerId?: string | null;
				isAiAssisted?: boolean;
			}
		) => {
			const id = await createAndSubmit({
				jobTitle: data.jobTitle ?? data.personalInfo?.profession ?? "Untitled CV",
				formData: data,
				isAiAssisted: data.isAiAssisted ?? false,
				sourceJobSeekerId: data.sourceJobSeekerId ?? undefined,
			});
			return { id };
		},
	};
}

export function useDrafts() {
	const cvs = useCVs();
	const drafts = (cvs ?? []).filter((cv: CVData) => cv.status === "draft");
	return { data: drafts, isLoading: cvs === undefined };
}
