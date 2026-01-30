"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useBuiltCVs } from "@/queries/cv";

export type CVStatus = "raw" | "draft" | "completed";

export interface JobSeekerWithCVStatus {
	jobSeeker: Doc<"jobSeekers">;
	cvStatus: CVStatus;
	linkedCvId: string | null;
	linkedCvStatus: "draft" | "completed" | null;
}

export function useJobSeekersWithCVStatus(): {
	data: JobSeekerWithCVStatus[];
	jobSeekersLoading: boolean;
	cvsLoading: boolean;
	isLoading: boolean;
} {
	const jobSeekers = useQuery(api.jobSeekers.getAllJobSeekers);
	const { data: cvsData, isLoading: cvsLoading } = useBuiltCVs();

	const jobSeekersLoading = jobSeekers === undefined;
	const cvsList = (cvsData?.data ?? []) as Array<{
		id: string;
		sourceJobSeekerId: string | null;
		status: "draft" | "completed";
	}>;

	// Build a map of job seeker ID to their linked CV
	const cvByJobSeeker = new Map<string | null, (typeof cvsList)[0]>();
	for (const cv of cvsList) {
		if (cv.sourceJobSeekerId) {
			cvByJobSeeker.set(cv.sourceJobSeekerId, cv);
		}
	}

	const data: JobSeekerWithCVStatus[] =
		jobSeekers?.map((js) => {
			const linked = cvByJobSeeker.get(js._id) ?? null;
			const cvStatus: CVStatus = linked
				? linked.status === "completed"
					? "completed"
					: "draft"
				: "raw";
			return {
				jobSeeker: js,
				cvStatus,
				linkedCvId: linked?.id ?? null,
				linkedCvStatus: linked?.status ?? null,
			};
		}) ?? [];

	return {
		data,
		jobSeekersLoading,
		cvsLoading,
		isLoading: jobSeekersLoading || cvsLoading,
	};
}
