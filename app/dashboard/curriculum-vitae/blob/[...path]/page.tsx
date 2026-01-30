"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { ArrowLeft, FileText, Download, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Cv } from "../../../../../schemas/cv.schema";

interface BlobViewerPageProps {
	params: Promise<{
		path: string[];
	}>;
}

interface ApiResponse {
	success: boolean;
	data: Cv;
	error?: string;
}

export default function BlobViewerPage({ params }: BlobViewerPageProps) {
	const { path } = use(params);
	const router = useRouter();
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [filename, setFilename] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchBlobUrl() {
			try {
				// Reconstruct the pathname from the path array
				// Next.js automatically decodes URL-encoded segments, so path already contains decoded values
				const pathname = path.join("/");

				// Normalize the pathname for comparison (ensure consistent format)
				const normalizedPathname = pathname.startsWith("/") ? pathname.slice(1) : pathname;

				// Fetch the blob list to find the matching blob
				const response = await fetch("/api/blob/list");
				const result = await response.json();

				if (!response.ok || !result.success) {
					throw new Error(result.error || "Failed to fetch blob");
				}

				// Normalize blob pathnames for comparison
				// Handle both encoded and decoded versions, and paths with/without leading slashes
				const normalizeBlobPath = (blobPath: string): string => {
					// Remove leading slash if present
					let normalized = blobPath.startsWith("/") ? blobPath.slice(1) : blobPath;
					// Decode any URL encoding that might still be present
					try {
						normalized = decodeURIComponent(normalized);
					} catch {
						// If decoding fails, use as-is (might already be decoded)
					}
					return normalized;
				};

				const normalizedSearchPath = normalizeBlobPath(normalizedPathname);

				const blob = result.data.find((b: { pathname: string }) => {
					const normalizedBlobPath = normalizeBlobPath(b.pathname);
					return normalizedBlobPath === normalizedSearchPath;
				});

				if (!blob) {
					console.error("Blob not found. Searched for:", normalizedSearchPath);
					console.error(
						"Available blobs:",
						result.data.map((b: { pathname: string }) => normalizeBlobPath(b.pathname))
					);
					throw new Error(`CV not found: ${normalizedPathname}`);
				}

				setBlobUrl(blob.url);
				setFilename(blob.filename);
				setLoading(false);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load CV");
				setLoading(false);
			}
		}

		fetchBlobUrl();
	}, [path]);

	const handleDownload = () => {
		if (blobUrl) {
			window.open(blobUrl, "_blank");
		}
	};

	// Save CV mutation (defined first so it can be referenced)
	const saveCVMutation = useMutation({
		mutationFn: async (cvData: Cv) => {
			const response = await fetch("/api/cv/submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					executiveSummary: cvData.executiveSummary,
					personalInfo: cvData.personalInfo,
					workHistory: cvData.workHistory,
					education: cvData.education,
					skills: cvData.skills,
					isAiAssisted: true,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save CV");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success("CV saved successfully!");
			router.push("/dashboard/curriculum-vitae/view/" + data.id);
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to save CV";
			toast.error(errorMessage);
		},
	});

	// AI Extract mutation
	const extractCVMutation = useMutation({
		mutationFn: async (blobUrl: string): Promise<ApiResponse> => {
			const formData = new FormData();
			formData.append("blobUrl", blobUrl);

			const response = await fetch("/api/cv/ai-extract", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to process CV");
			}

			return result;
		},
		onSuccess: (data) => {
			toast.success("CV extracted successfully! Saving to database...");
			// Automatically save after extraction
			saveCVMutation.mutate(data.data);
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to process CV";
			toast.error(errorMessage);
		},
	});

	const handleAIExtract = useCallback(() => {
		if (blobUrl) {
			extractCVMutation.mutate(blobUrl);
		}
	}, [blobUrl, extractCVMutation]);

	const isExtracting = extractCVMutation.isPending;
	const isSaving = saveCVMutation.isPending;
	const isProcessing = isExtracting || isSaving;

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50/50">
				<div className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
					<p className="text-gray-600">Loading CV...</p>
				</div>
			</div>
		);
	}

	if (error || !blobUrl) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50/50">
				<div className="text-center">
					<p className="mb-4 text-red-600">{error || "CV not found"}</p>
					<Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50/50">
			{/* Header */}
			<div className="mx-auto max-w-7xl px-6 py-4">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" onClick={() => router.back()}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						<div className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-gray-600" />
							<h1 className="text-2xl font-bold text-gray-900">{filename}</h1>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							onClick={handleAIExtract}
							disabled={isProcessing}
							className="bg-primary hover:bg-primary/90"
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{isExtracting ? "Extracting..." : "Saving..."}
								</>
							) : (
								<>
									<Sparkles className="mr-2 h-4 w-4" />
									AI Extract & Save
								</>
							)}
						</Button>
						<Button onClick={handleDownload} variant="outline">
							<Download className="mr-2 h-4 w-4" />
							Download
						</Button>
					</div>
				</div>

				{/* PDF Viewer */}
				<Card>
					<CardContent className="p-0">
						<div className="h-[calc(100vh-200px)] w-full">
							<iframe src={blobUrl} className="h-full w-full border-0" title={filename} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
