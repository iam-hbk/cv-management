"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Briefcase } from "lucide-react";

import { Skeleton } from "../../../components/ui/skeleton";
import { VacanciesTable } from "../../../components/admin/vacancies-table";
import { AddVacancyDialog } from "../../../components/admin/add-vacancy-dialog";

export default function VacanciesPage() {
	const vacancies = useQuery(api.vacancies.getAllVacancies);

	const isLoading = vacancies === undefined;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<Briefcase className="h-8 w-8" />
					<div>
						<h1 className="text-3xl font-bold">Vacancies</h1>
						<p className="text-muted-foreground">Review and manage job vacancy submissions</p>
					</div>
				</div>
				<AddVacancyDialog />
			</div>

			{isLoading ? (
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
			) : (
				<VacanciesTable vacancies={vacancies} />
			)}
		</div>
	);
}
