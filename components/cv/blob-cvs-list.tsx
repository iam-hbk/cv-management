"use client";

import Link from "next/link";
import { FileText, Sparkles, Eye } from "lucide-react";
import { format } from "date-fns";

import { useBlobCVs } from "../../hooks/use-blob-cvs";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

function buildBlobPath(pathname: string): string {
	const pathSegments = pathname.split("/").filter(Boolean);
	return `/dashboard/curriculum-vitae/blob/${pathSegments.join("/")}`;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface BlobCVsListProps {
	variant: "cards" | "picker";
}

export function BlobCVsList({ variant }: BlobCVsListProps) {
	const { data, isLoading, error } = useBlobCVs();
	const cvs = data?.data ?? [];

	if (isLoading) {
		return (
			<div
				className={variant === "cards" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2"}
			>
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-24 w-full" />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<p className="text-sm text-destructive">
				{error instanceof Error ? error.message : "Failed to load uploaded CVs"}
			</p>
		);
	}

	if (cvs.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
				<FileText className="mb-3 h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">
					{variant === "picker" ? "No uploaded CVs yet" : "No uploaded CVs"}
				</p>
				{variant === "cards" && (
					<Button variant="link" className="mt-2" asChild>
						<Link href="/dashboard/curriculum-vitae/new/ai-extract">
							Go to AI Extract to upload
						</Link>
					</Button>
				)}
			</div>
		);
	}

	if (variant === "picker") {
		return (
			<div className="grid gap-2 sm:grid-cols-2">
				{cvs.map((cv) => (
					<Link
						key={cv.pathname}
						href={`/dashboard/curriculum-vitae/new/ai-extract?blobUrl=${encodeURIComponent(cv.url)}`}
						className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
					>
						<FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium">{cv.filename}</p>
							<p className="text-xs text-muted-foreground">
								{formatFileSize(cv.size)} · {format(new Date(cv.uploadedAt), "MMM d, yyyy")}
							</p>
						</div>
						<Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
					</Link>
				))}
			</div>
		);
	}

	// variant === "cards"
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{cvs.map((cv) => (
				<Card key={cv.pathname} className="flex flex-col">
					<CardHeader className="pb-2">
						<div className="flex items-start gap-2">
							<FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium">{cv.filename}</p>
								<p className="text-xs text-muted-foreground">
									{formatFileSize(cv.size)} · {format(new Date(cv.uploadedAt), "MMM d, yyyy")}
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className="mt-auto flex gap-2 pt-0">
						<Button variant="default" size="sm" asChild>
							<Link href={buildBlobPath(cv.pathname)}>
								<Eye className="mr-2 h-4 w-4" />
								View
							</Link>
						</Button>
						<Button variant="outline" size="sm" asChild>
							<Link
								href={`/dashboard/curriculum-vitae/new/ai-extract?blobUrl=${encodeURIComponent(cv.url)}`}
							>
								<Sparkles className="mr-2 h-4 w-4" />
								AI Extract
							</Link>
						</Button>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
