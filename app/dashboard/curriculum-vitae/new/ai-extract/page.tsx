"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCreateAndSubmitCV } from "@/queries/cv";
import { useMutation } from "@tanstack/react-query";
import { useAction, useQuery } from "convex/react";
import {
	AlertCircle,
	CheckCircle,
	FileOutput,
	FileText,
	Loader2,
	Palette,
	Sparkles,
	Upload,
	User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../../../components/ui/card";
import { Separator } from "../../../../../components/ui/separator";
import type { Cv } from "../../../../../schemas/cv.schema";

interface ApiResponse {
	success: boolean;
	data: Cv;
	error?: string;
}

function AIExtractPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [extractedData, setExtractedData] = useState<Cv | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// Job seeker source support
	const sourceType = searchParams.get("source");
	const jobSeekerId = searchParams.get("id");
	const isJobSeekerSource = sourceType === "job-seeker" && jobSeekerId;

	// Mode support: 'extract' (default), 'branding', 'extract-branding'
	const mode = searchParams.get("mode") || "extract";
	const isBrandingMode = mode === "branding";
	const isExtractBrandingMode = mode === "extract-branding";

	// Fetch job seeker data if source is job-seeker (for display purposes)
	const jobSeeker = useQuery(
		api.jobSeekers.getJobSeekerById,
		isJobSeekerSource ? { id: jobSeekerId as Id<"jobSeekers"> } : "skip"
	);

	// Action to get fresh CV URL
	const getFreshCvUrl = useAction(api.jobSeekersActions.getFreshCvUrl);

	// State for fresh CV URL and loading
	const [freshCvUrl, setFreshCvUrl] = useState<string | null>(null);
	const [isFetchingUrl, setIsFetchingUrl] = useState(false);
	const [urlError, setUrlError] = useState<string | null>(null);

	// Fetch fresh CV URL when job seeker is loaded
	useEffect(() => {
		if (isJobSeekerSource && jobSeeker && !freshCvUrl && !isFetchingUrl && !urlError) {
			setIsFetchingUrl(true);
			getFreshCvUrl({ jobSeekerId: jobSeekerId as Id<"jobSeekers"> })
				.then((result) => {
					setFreshCvUrl(result.url);
					setUrlError(null);
				})
				.catch((error) => {
					console.error("Failed to get fresh CV URL:", error);
					setUrlError(error instanceof Error ? error.message : "Failed to get CV URL");
				})
				.finally(() => {
					setIsFetchingUrl(false);
				});
		}
	}, [
		isJobSeekerSource,
		jobSeeker,
		jobSeekerId,
		getFreshCvUrl,
		freshCvUrl,
		isFetchingUrl,
		urlError,
	]);

	// Convex mutation for saving CVs
	const createAndSubmit = useCreateAndSubmitCV();

	// Local state for tracking save operations
	const [isSavingCV, setIsSavingCV] = useState(false);
	const [isSavingAndGenerating, setIsSavingAndGenerating] = useState(false);

	// Extract CV mutation (calls AI extract API)
	const extractCVMutation = useMutation({
		mutationFn: async (input: File | string): Promise<ApiResponse> => {
			const formData = new FormData();

			if (typeof input === "string") {
				// Handle URL (job seeker's CV URL)
				formData.append("blobUrl", input);
			} else {
				// Handle file upload
				formData.append("pdf", input);
			}

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
			setExtractedData(data.data);
			setSelectedFile(null);
			toast.success("CV extracted successfully!");
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to process CV";
			toast.error(errorMessage);
		},
	});

	const handleExtractFromUrl = useCallback(() => {
		if (freshCvUrl) {
			extractCVMutation.mutate(freshCvUrl);
		}
	}, [freshCvUrl, extractCVMutation]);

	const handleExtractFromFile = useCallback(() => {
		if (selectedFile) {
			extractCVMutation.mutate(selectedFile);
		}
	}, [selectedFile, extractCVMutation]);

	// Generate branded CV document mutation
	const generateBrandedCVMutation = useMutation({
		mutationFn: async (cvData: Cv) => {
			const response = await fetch("/api/cv/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					executiveSummary: cvData.executiveSummary,
					jobTitle: cvData.personalInfo.profession || "Professional",
					personalInfo: cvData.personalInfo,
					workHistory: cvData.workHistory,
					education: cvData.education,
					skills: cvData.skills,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to generate branded CV");
			}

			// Get the blob and download it
			const blob = await response.blob();
			const contentDisposition = response.headers.get("content-disposition");
			let filename = "CV.docx";
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="?([^"]+)"?/);
				if (match) filename = match[1];
			}

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			return { filename };
		},
		onSuccess: ({ filename }) => {
			toast.success(`Branded CV downloaded: ${filename}`);
		},
		onError: (error) => {
			const errorMessage = error instanceof Error ? error.message : "Failed to generate branded CV";
			toast.error(errorMessage);
		},
	});

	const handleFileSelect = useCallback((file: File) => {
		// Validate file type
		const allowedTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"text/plain",
		];

		if (!allowedTypes.includes(file.type)) {
			toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
			return;
		}

		// Validate file size (10MB limit)
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10MB");
			return;
		}

		// Store the file instead of immediately processing
		setSelectedFile(file);
		setExtractedData(null);
	}, []);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);

			if (e.dataTransfer.files?.[0]) {
				handleFileSelect(e.dataTransfer.files[0]);
			}
		},
		[handleFileSelect]
	);

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files?.[0]) {
				handleFileSelect(e.target.files[0]);
			}
		},
		[handleFileSelect]
	);

	// Continue to Edit - stores in sessionStorage and redirects to form wizard
	const handleContinueToEdit = useCallback(() => {
		if (!extractedData) return;

		try {
			sessionStorage.setItem("aiExtractedCV", JSON.stringify(extractedData));
			router.push("/dashboard/curriculum-vitae/new");
		} catch {
			toast.error("Failed to save CV data");
		}
	}, [extractedData, router]);

	// Save CV directly using Convex
	const handleSaveCVDirectly = useCallback(async () => {
		if (!extractedData) return;

		setIsSavingCV(true);
		try {
			await createAndSubmit({
				jobTitle: extractedData.personalInfo.profession || "Professional",
				formData: {
					executiveSummary: extractedData.executiveSummary,
					personalInfo: extractedData.personalInfo,
					workHistory: extractedData.workHistory,
					education: extractedData.education,
					skills: extractedData.skills,
				},
				isAiAssisted: true,
				sourceJobSeekerId: isJobSeekerSource ? (jobSeekerId ?? undefined) : undefined,
			});
			toast.success("CV saved successfully!");
			setExtractedData(null);
			router.push("/dashboard/curriculum-vitae");
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to save CV";
			toast.error(errorMessage);
		} finally {
			setIsSavingCV(false);
		}
	}, [extractedData, createAndSubmit, isJobSeekerSource, jobSeekerId, router]);

	// Generate branded CV only (download without saving)
	const handleGenerateBrandedCV = useCallback(() => {
		if (!extractedData) return;
		generateBrandedCVMutation.mutate(extractedData);
	}, [extractedData, generateBrandedCVMutation]);

	// Save CV and generate branded document
	const handleSaveAndGenerateBranded = useCallback(async () => {
		if (!extractedData) return;

		setIsSavingAndGenerating(true);
		try {
			// First save the CV using Convex
			await createAndSubmit({
				jobTitle: extractedData.personalInfo.profession || "Professional",
				formData: {
					executiveSummary: extractedData.executiveSummary,
					personalInfo: extractedData.personalInfo,
					workHistory: extractedData.workHistory,
					education: extractedData.education,
					skills: extractedData.skills,
				},
				isAiAssisted: true,
				sourceJobSeekerId: isJobSeekerSource ? (jobSeekerId ?? undefined) : undefined,
			});

			// Then generate the branded document
			const response = await fetch("/api/cv/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					executiveSummary: extractedData.executiveSummary,
					jobTitle: extractedData.personalInfo.profession || "Professional",
					personalInfo: extractedData.personalInfo,
					workHistory: extractedData.workHistory,
					education: extractedData.education,
					skills: extractedData.skills,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to generate branded CV");
			}

			// Get the blob and download it
			const blob = await response.blob();
			const contentDisposition = response.headers.get("content-disposition");
			let filename = "CV.docx";
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="?([^"]+)"?/);
				if (match) filename = match[1];
			}

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast.success(`CV saved and branded document downloaded: ${filename}`);
			setExtractedData(null);
			router.push("/dashboard/curriculum-vitae");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to save and generate CV";
			toast.error(errorMessage);
		} finally {
			setIsSavingAndGenerating(false);
		}
	}, [extractedData, createAndSubmit, isJobSeekerSource, jobSeekerId, router]);

	const isProcessing = extractCVMutation.isPending;
	const isGeneratingBranded = generateBrandedCVMutation.isPending;
	const isAnyMutationPending = isSavingCV || isGeneratingBranded || isSavingAndGenerating;

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
						{isBrandingMode && (
							<>
								<Palette className="h-8 w-8 text-blue-500" />
								Convert CV to Branding
							</>
						)}
						{isExtractBrandingMode && (
							<>
								<FileOutput className="h-8 w-8 text-green-500" />
								AI Extract + Branding
							</>
						)}
						{!isBrandingMode && !isExtractBrandingMode && (
							<>
								<Sparkles className="h-8 w-8 text-purple-500" />
								AI CV Extraction
							</>
						)}
					</h1>
					<p className="text-muted-foreground mt-2">
						{isBrandingMode && "Extract CV data and convert it to your company's branded template"}
						{isExtractBrandingMode &&
							"Extract CV data with AI and automatically generate a branded document"}
						{!isBrandingMode &&
							!isExtractBrandingMode &&
							"Upload your CV and let AI extract the information automatically"}
					</p>
				</div>

				{/* Job Seeker Source Section */}
				{isJobSeekerSource && jobSeeker && !extractedData && !isProcessing && (
					<Card className="border-primary/50 bg-primary/5">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								CV from Job Seeker: {jobSeeker.firstName} {jobSeeker.lastName}
							</CardTitle>
							<CardDescription>
								Extracting CV for this job seeker. The generated CV will be linked to their profile.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="rounded-lg bg-muted p-3 space-y-1">
									<p className="text-sm">
										<span className="font-medium">Email:</span> {jobSeeker.email}
									</p>
									<p className="text-sm">
										<span className="font-medium">Phone:</span> {jobSeeker.mobileNumber}
									</p>
								</div>
								{isFetchingUrl ? (
									<div className="flex items-center justify-center gap-2 py-4">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-sm text-muted-foreground">Loading CV...</span>
									</div>
								) : urlError ? (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{urlError}</AlertDescription>
									</Alert>
								) : freshCvUrl ? (
									<Button onClick={handleExtractFromUrl} className="w-full" size="lg">
										<Sparkles className="mr-2 h-4 w-4" />
										Start AI Extraction
									</Button>
								) : (
									<p className="text-sm text-muted-foreground text-center">
										No CV file found for this job seeker. Please upload a CV first.
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Selected File Section */}
				{selectedFile && !extractedData && !isProcessing && (
					<Card className="border-primary/50 bg-primary/5">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Selected CV File
							</CardTitle>
							<CardDescription>
								A file has been selected. Click the button below to start AI extraction.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="rounded-lg bg-muted p-3">
									<p className="text-xs font-medium text-muted-foreground mb-1">File Name:</p>
									<p className="text-sm font-medium">{selectedFile.name}</p>
									<p className="text-xs text-muted-foreground mt-1">
										{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								<div className="flex gap-2">
									<Button onClick={handleExtractFromFile} className="flex-1" size="lg">
										<Sparkles className="mr-2 h-4 w-4" />
										Start AI Extraction
									</Button>
									<Button onClick={() => setSelectedFile(null)} variant="outline">
										Remove File
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Upload Section - only show when not coming from job seeker and no file selected */}
				{!selectedFile && !extractedData && !isJobSeekerSource && !isProcessing && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Upload className="h-5 w-5" />
								Upload CV File
							</CardTitle>
							<CardDescription>Supported formats: PDF, DOC, DOCX, TXT (max 10MB)</CardDescription>
						</CardHeader>
						<CardContent>
							<div
								className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
									dragActive
										? "border-primary bg-primary/5"
										: "border-muted-foreground/25 hover:border-muted-foreground/50"
								}`}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
							>
								<div className="flex flex-col items-center gap-4">
									<FileText className="h-12 w-12 text-muted-foreground" />
									<div>
										<p className="font-medium">Drop your CV file here</p>
										<p className="text-sm text-muted-foreground">or click to browse</p>
									</div>
									<input
										type="file"
										accept=".pdf,.doc,.docx,.txt"
										onChange={handleFileInput}
										className="hidden"
										id="cv-file-input"
									/>
									<Button asChild variant="outline">
										<label htmlFor="cv-file-input" className="cursor-pointer">
											Choose File
										</label>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Processing State */}
				{isProcessing && !extractedData && (
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col items-center gap-4 py-8">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
								<div>
									<p className="font-medium">AI is processing your CV...</p>
									<p className="text-sm text-muted-foreground">This may take a few moments</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Error Display */}
				{extractCVMutation.isError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{extractCVMutation.error instanceof Error
								? extractCVMutation.error.message
								: "An error occurred while processing your CV"}
						</AlertDescription>
					</Alert>
				)}

				{/* Extracted Data Display */}
				{extractedData && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CheckCircle className="h-5 w-5 text-green-500" />
								Extraction Complete
							</CardTitle>
							<CardDescription>Review the extracted information below</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Basic Info */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="text-sm font-medium">Name</label>
									<p className="text-sm text-muted-foreground">
										{extractedData.personalInfo.firstName} {extractedData.personalInfo.lastName}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium">Profession</label>
									<p className="text-sm text-muted-foreground">
										{extractedData.personalInfo.profession}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium">Email</label>
									<p className="text-sm text-muted-foreground">
										{extractedData.personalInfo.email}
									</p>
								</div>
							</div>

							<Separator />

							{/* Personal Information */}
							<div>
								<h3 className="font-semibold mb-3">Personal Information</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
									<div>
										<label className="font-medium">Name</label>
										<p className="text-muted-foreground">
											{extractedData.personalInfo.firstName} {extractedData.personalInfo.lastName}
										</p>
									</div>
									<div>
										<label className="font-medium">Email</label>
										<p className="text-muted-foreground">{extractedData.personalInfo.email}</p>
									</div>
									<div>
										<label className="font-medium">Phone</label>
										<p className="text-muted-foreground">{extractedData.personalInfo.phone}</p>
									</div>
									<div>
										<label className="font-medium">Location</label>
										<p className="text-muted-foreground">{extractedData.personalInfo.location}</p>
									</div>
									<div>
										<label className="font-medium">Profession</label>
										<p className="text-muted-foreground">{extractedData.personalInfo.profession}</p>
									</div>
									<div>
										<label className="font-medium">Nationality</label>
										<p className="text-muted-foreground">
											{extractedData.personalInfo.nationality}
										</p>
									</div>
									<div>
										<label className="font-medium">Gender</label>
										<p className="text-muted-foreground capitalize">
											{extractedData.personalInfo.gender}
										</p>
									</div>
									<div>
										<label className="font-medium">Availability</label>
										<p className="text-muted-foreground">
											{extractedData.personalInfo.availability}
										</p>
									</div>
									<div>
										<label className="font-medium">Current Salary</label>
										<p className="text-muted-foreground">
											${extractedData.personalInfo.currentSalary.toLocaleString()}
										</p>
									</div>
									<div>
										<label className="font-medium">Expected Salary</label>
										<p className="text-muted-foreground">
											${extractedData.personalInfo.expectedSalary.toLocaleString()}
										</p>
									</div>
								</div>
							</div>

							<Separator />

							{/* Executive Summary */}
							<div>
								<h3 className="font-semibold mb-3">Executive Summary</h3>
								<p className="text-sm text-muted-foreground bg-muted p-3 rounded">
									{extractedData.executiveSummary}
								</p>
							</div>

							<Separator />

							{/* Work Experience */}
							<div>
								<h3 className="font-semibold mb-3">Work Experience</h3>
								<div className="space-y-3">
									{extractedData.workHistory.experiences.length > 0 ? (
										extractedData.workHistory.experiences.map((exp, index) => (
											<div key={index} className="border rounded p-3">
												<div className="flex justify-between items-start mb-2">
													<h4 className="font-medium">{exp.position}</h4>
													<span className="text-sm text-muted-foreground">
														{exp.startDate} - {exp.endDate || "Present"}
													</span>
												</div>
												<p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
												{exp.duties.length > 0 && (
													<ul className="text-sm text-muted-foreground list-disc list-inside">
														{exp.duties.map((duty, i) => (
															<li key={i}>{duty}</li>
														))}
													</ul>
												)}
												{exp.reasonForLeaving && (
													<p className="text-sm text-muted-foreground mt-2">
														<span className="font-medium">Reason for leaving:</span>{" "}
														{exp.reasonForLeaving}
													</p>
												)}
											</div>
										))
									) : (
										<p className="text-sm text-muted-foreground">No work experience found</p>
									)}
								</div>
							</div>

							<Separator />

							{/* Education */}
							<div>
								<h3 className="font-semibold mb-3">Education</h3>
								<div className="space-y-2">
									{extractedData.education.educations.length > 0 ? (
										extractedData.education.educations.map((edu, index) => (
											<div
												key={index}
												className="flex justify-between items-center p-2 border rounded"
											>
												<div>
													<p className="font-medium">{edu.qualification}</p>
													<p className="text-sm text-muted-foreground">{edu.institution}</p>
												</div>
												<span className="text-sm text-muted-foreground">{edu.completionDate}</span>
											</div>
										))
									) : (
										<p className="text-sm text-muted-foreground">No education information found</p>
									)}
								</div>
							</div>

							<Separator />

							{/* Skills */}
							<div>
								<h3 className="font-semibold mb-3">Skills</h3>
								<div className="space-y-3">
									{extractedData.skills.computerSkills.length > 0 && (
										<div>
											<label className="text-sm font-medium">Computer Skills</label>
											<div className="flex flex-wrap gap-2 mt-1">
												{extractedData.skills.computerSkills.map((skill, index) => (
													<Badge key={index} variant="secondary">
														{skill}
													</Badge>
												))}
											</div>
										</div>
									)}
									{extractedData.skills.otherSkills.length > 0 && (
										<div>
											<label className="text-sm font-medium">Other Skills</label>
											<div className="flex flex-wrap gap-2 mt-1">
												{extractedData.skills.otherSkills.map((skill, index) => (
													<Badge key={index} variant="secondary">
														{skill}
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col gap-4 pt-6">
								{/* Primary Actions Row */}
								<div className="flex gap-4">
									<Button
										onClick={handleSaveCVDirectly}
										disabled={isAnyMutationPending}
										className="flex-1 bg-green-600 hover:bg-green-700"
									>
										{isSavingCV ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Saving CV...
											</>
										) : (
											<>
												<CheckCircle className="h-4 w-4 mr-2" />
												Save CV Now
											</>
										)}
									</Button>
									<Button
										onClick={handleContinueToEdit}
										variant="outline"
										className="flex-1"
										disabled={isAnyMutationPending}
									>
										Continue to Edit
									</Button>
								</div>

								{/* Branding Actions Row */}
								<div className="flex gap-4">
									<Button
										onClick={handleGenerateBrandedCV}
										disabled={isAnyMutationPending}
										variant="outline"
										className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
									>
										{isGeneratingBranded ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Generating...
											</>
										) : (
											<>
												<Palette className="h-4 w-4 mr-2" />
												Download Branded CV
											</>
										)}
									</Button>
									<Button
										onClick={handleSaveAndGenerateBranded}
										disabled={isAnyMutationPending}
										className="flex-1 bg-blue-600 hover:bg-blue-700"
									>
										{isSavingAndGenerating ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Processing...
											</>
										) : (
											<>
												<FileOutput className="h-4 w-4 mr-2" />
												Save + Download Branded
											</>
										)}
									</Button>
								</div>

								{/* Secondary Actions */}
								<Button
									variant="ghost"
									onClick={() => {
										setExtractedData(null);
										setSelectedFile(null);
									}}
									disabled={isAnyMutationPending}
									className="w-full"
								>
									Upload Another CV
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

export default function AIExtractPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto py-8 px-4">
					<div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-4 py-16">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-muted-foreground">Loading...</p>
					</div>
				</div>
			}
		>
			<AIExtractPageContent />
		</Suspense>
	);
}
