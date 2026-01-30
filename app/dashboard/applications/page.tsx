"use client";

import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FileText, Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { useApplicationFilters } from "@/hooks/use-application-filters";

function ApplicationsLoading() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full max-w-sm" />
			<div className="rounded-md border">
				<div className="p-4 space-y-4">
					{[...Array(5)].map((_, i) => (
						<Skeleton key={`skeleton-${i}`} className="h-12 w-full" />
					))}
				</div>
			</div>
		</div>
	);
}

function ApplicationsContent() {
	const { status, search, sort, order, page } = useApplicationFilters();
	const applications = useQuery(api.applications.getApplicationsWithDetails);

	if (applications === undefined) {
		return <ApplicationsLoading />;
	}

	return <ApplicationsTable applications={applications} />;
}

export default function ApplicationsPage() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<FileText className="h-8 w-8" />
					<div>
						<h1 className="text-3xl font-bold">Applications</h1>
						<p className="text-muted-foreground">Review and manage job applications</p>
					</div>
				</div>
			</div>

			<Suspense fallback={<ApplicationsLoading />}>
				<ApplicationsContent />
			</Suspense>
		</div>
	);
}
