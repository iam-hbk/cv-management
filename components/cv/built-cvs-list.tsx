"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";

import { useBuiltCVs } from "../../queries/cv";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { type BuiltCV, CVCard } from "./cv-card";

interface BuiltCVsListProps {
	variant: "cards";
}

export function BuiltCVsList({ variant }: BuiltCVsListProps) {
	const { data, isLoading } = useBuiltCVs();
	const cvs = (data?.data ?? []) as BuiltCV[];

	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-48 w-full" />
				))}
			</div>
		);
	}

	if (cvs.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
				<BookOpen className="mb-3 h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">No CVs yet</p>
				<Button variant="link" className="mt-2" asChild>
					<Link href="/dashboard/curriculum-vitae/new">Create your first CV</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{cvs.map((cv) => (
				<CVCard key={cv.id} cv={cv} />
			))}
		</div>
	);
}
