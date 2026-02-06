"use client";

import {
	Briefcase,
	Calendar,
	Code,
	Download,
	Edit,
	FileText,
	GraduationCap,
	Loader2,
	Mail,
	MapPin,
	Phone,
	User,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Separator } from "../../../../../components/ui/separator";
import { useCV } from "../../../../../hooks/use-cv";
import {
	AVAILABILITY_OPTIONS,
	type Availability,
	type CVFormData,
} from "../../../../../schemas/cv.schema";

// Helper to validate availability from database
function toValidAvailability(val: string | undefined): Availability {
	if (val && AVAILABILITY_OPTIONS.includes(val as Availability)) {
		return val as Availability;
	}
	return "Negotiable";
}

interface CVViewPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function CVViewPage({ params }: CVViewPageProps) {
	const { id } = use(params);
	// Convex useQuery returns the data directly, undefined while loading, or null if not found
	const cvResult = useCV(id);
	const isLoading = cvResult === undefined;
	const cv = cvResult ?? null;

	const [isExportingDocx, setIsExportingDocx] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);
	const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

	// Cleanup blob URL on unmount
	useEffect(() => {
		return () => {
			if (downloadUrl) {
				window.URL.revokeObjectURL(downloadUrl);
			}
		};
	}, [downloadUrl]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50/50">
				<div className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
					<p className="text-gray-600">Loading CV...</p>
				</div>
			</div>
		);
	}

	if (!cv) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50/50">
				<div className="text-center">
					<p className="mb-4 text-red-600">CV not found</p>
					<Link href="/dashboard">
						<Button>Back to Dashboard</Button>
					</Link>
				</div>
			</div>
		);
	}

	// Extract data with safe defaults for optional fields
	const personalInfo = {
		firstName: cv.formData.personalInfo?.firstName ?? "",
		lastName: cv.formData.personalInfo?.lastName ?? "",
		email: cv.formData.personalInfo?.email ?? "",
		phone: cv.formData.personalInfo?.phone ?? "",
		profession: cv.formData.personalInfo?.profession ?? "",
		location: cv.formData.personalInfo?.location ?? "",
		gender: cv.formData.personalInfo?.gender ?? ("other" as const),
		availability: toValidAvailability(cv.formData.personalInfo?.availability),
		nationality: cv.formData.personalInfo?.nationality ?? "",
		currentSalary: cv.formData.personalInfo?.currentSalary ?? 0,
		expectedSalary: cv.formData.personalInfo?.expectedSalary ?? 0,
		driversLicense: cv.formData.personalInfo?.driversLicense ?? false,
		idNumber: cv.formData.personalInfo?.idNumber ?? "",
	};

	const workExperiences = (cv.formData.workHistory?.experiences ?? []).map((exp) => ({
		company: exp.company ?? "",
		position: exp.position ?? "",
		startDate: exp.startDate ?? "",
		endDate: exp.endDate ?? "",
		current: exp.current ?? false,
		duties: exp.duties ?? [],
		reasonForLeaving: exp.reasonForLeaving ?? "",
	}));

	const educations = (cv.formData.education?.educations ?? []).map((edu) => ({
		institution: edu.institution ?? "",
		qualification: edu.qualification ?? "",
		completionDate: edu.completionDate ?? new Date().getFullYear(),
		completed: edu.completed ?? false,
	}));

	const skills = {
		computerSkills: cv.formData.skills?.computerSkills ?? [],
		otherSkills: cv.formData.skills?.otherSkills ?? [],
		skillsMatrix: (cv.formData.skills?.skillsMatrix ?? []).map((s) => ({
			skill: s.skill ?? "",
			yearsExperience: s.yearsExperience ?? 0,
			proficiency: s.proficiency ?? ("Beginner" as const),
			lastUsed: s.lastUsed ?? new Date().getFullYear(),
		})),
	};

	// Build strict CVFormData for API calls
	const strictFormData: CVFormData = {
		executiveSummary: cv.formData.executiveSummary ?? "",
		personalInfo,
		workHistory: { experiences: workExperiences },
		education: { educations },
		skills,
	};

	const formatDate = (date: Date | string | number | undefined) => {
		if (!date) return "Present";
		if (typeof date === "number") {
			return new Date(date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
		}
		const d = typeof date === "string" ? new Date(date) : date;
		return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
	};

	const formatSalary = (salary: number | undefined) => {
		if (!salary) return "Not specified";
		return new Intl.NumberFormat("en-ZA", {
			style: "currency",
			currency: "ZAR",
			minimumFractionDigits: 0,
		}).format(salary);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800 border-green-200";
			case "draft":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const handleExportDocx = async () => {
		if (!cv) return;

		setIsExportingDocx(true);
		setExportError(null);

		try {
			// Import transform function dynamically to avoid circular deps
			const { transformCVToAPIFormat } = await import("../../../../../utils/cv-transform");

			// Transform CV data to API format using strict data
			const apiData = transformCVToAPIFormat(strictFormData);

			// Make API request through Next.js proxy route (avoids CORS issues)
			const response = await fetch("/api/cv/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(apiData),
			});

			if (!response.ok) {
				if (response.status === 422) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(
						errorData.detail
							? JSON.stringify(errorData.detail)
							: "Validation error: Invalid CV data"
					);
				}
				throw new Error(`Failed to generate CV: ${response.status} ${response.statusText}`);
			}

			// Use built-in filename
			const filename = `CV_${personalInfo.firstName}_${personalInfo.lastName}.docx`;

			// Convert response to blob
			const blob = await response.blob();

			// Create blob URL and store it for download
			const url = window.URL.createObjectURL(blob);

			// Cleanup previous URL if exists
			if (downloadUrl) {
				window.URL.revokeObjectURL(downloadUrl);
			}

			setDownloadUrl(url);

			// Show success toast with download link
			toast.success("CV exported successfully!", {
				description: `Your CV document "${filename}" is ready to download.`,
				action: {
					label: "Download",
					onClick: () => {
						const link = document.createElement("a");
						link.href = url;
						link.download = filename;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					},
				},
				duration: 10000, // Show for 10 seconds
			});
		} catch (error) {
			console.error("Error exporting DOCX:", error);
			setExportError(
				error instanceof Error ? error.message : "Failed to export CV. Please try again."
			);
		} finally {
			setIsExportingDocx(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50/50">
			{/* Header */}
			<div>
				<div className="mx-auto max-w-4xl px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">{cv.jobTitle}</h1>
								<div className="mt-1 flex items-center gap-2">
									<Badge variant="outline" className={getStatusColor(cv.status)}>
										{cv.status}
									</Badge>
									{cv.isAiAssisted && <Badge variant="secondary">AI Assisted</Badge>}
									<span className="text-sm text-gray-500">
										Created {formatDate(cv.createdAt)} by {cv.createdBy.name}
									</span>
								</div>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							<div className="flex items-center gap-2">
								<Link href={`/dashboard/curriculum-vitae/edit/${cv.id}`}>
									<Button variant="outline" size="sm">
										<Edit className="mr-2 h-4 w-4" />
										Edit CV
									</Button>
								</Link>
								<Button onClick={handleExportDocx} size="sm" disabled={isExportingDocx}>
									{isExportingDocx ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Exporting...
										</>
									) : (
										<>
											<Download className="mr-2 h-4 w-4" />
											Export DOCX
										</>
									)}
								</Button>
							</div>
							{exportError && (
								<Alert variant="destructive" className="w-full max-w-md">
									<AlertDescription>{exportError}</AlertDescription>
								</Alert>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-4xl px-6 py-8">
				<div className="space-y-8">
					{/* Executive Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Executive Summary
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="leading-relaxed text-gray-700">
								{cv.formData.executiveSummary ?? "No summary provided"}
							</p>
						</CardContent>
					</Card>

					{/* Personal Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Personal Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div className="space-y-4">
									<div>
										<h4 className="font-medium text-gray-900">Full Name</h4>
										<p className="text-gray-700">
											{personalInfo.firstName} {personalInfo.lastName}
										</p>
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Email</h4>
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-gray-400" />
											<p className="text-gray-700">{personalInfo.email || "Not specified"}</p>
										</div>
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Phone</h4>
										<div className="flex items-center gap-2">
											<Phone className="h-4 w-4 text-gray-400" />
											<p className="text-gray-700">{personalInfo.phone || "Not specified"}</p>
										</div>
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Location</h4>
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-gray-400" />
											<p className="text-gray-700">{personalInfo.location || "Not specified"}</p>
										</div>
									</div>
								</div>
								<div className="space-y-4">
									<div>
										<h4 className="font-medium text-gray-900">Profession</h4>
										<p className="text-gray-700">{personalInfo.profession || "Not specified"}</p>
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Nationality</h4>
										<p className="text-gray-700">{personalInfo.nationality || "Not specified"}</p>
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Availability</h4>
										<p className="text-gray-700">{personalInfo.availability || "Not specified"}</p>
									</div>
									<div>
										<h4 className="font-medium text-gray-900">Driver&apos;s License</h4>
										<p className="text-gray-700">{personalInfo.driversLicense ? "Yes" : "No"}</p>
									</div>
								</div>
							</div>
							<Separator className="my-6" />
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div>
									<h4 className="font-medium text-gray-900">Current Salary</h4>
									<p className="text-gray-700">{formatSalary(personalInfo.currentSalary)}</p>
								</div>
								<div>
									<h4 className="font-medium text-gray-900">Expected Salary</h4>
									<p className="text-gray-700">{formatSalary(personalInfo.expectedSalary)}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Work Experience */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Briefcase className="h-5 w-5" />
								Work Experience
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{workExperiences.length === 0 ? (
									<p className="text-gray-500">No work experience added</p>
								) : (
									workExperiences.map((exp, index) => (
										<div key={index} className="border-l-2 border-gray-200 pl-4">
											<div className="mb-2 flex items-center justify-between">
												<h4 className="font-semibold text-gray-900">{exp.position}</h4>
												<div className="flex items-center gap-2 text-sm text-gray-500">
													<Calendar className="h-4 w-4" />
													{formatDate(exp.startDate)} - {formatDate(exp.endDate)}
													{exp.current && <Badge variant="secondary">Current</Badge>}
												</div>
											</div>
											<p className="mb-2 font-medium text-gray-600">{exp.company}</p>
											{exp.duties.length > 0 && (
												<ul className="list-inside list-disc space-y-1 text-gray-700">
													{exp.duties.map((duty, dutyIndex) => (
														<li key={dutyIndex} className="text-sm">
															{duty}
														</li>
													))}
												</ul>
											)}
											{!exp.current && exp.reasonForLeaving && (
												<p className="mt-2 text-sm italic text-gray-500">
													Reason for leaving: {exp.reasonForLeaving}
												</p>
											)}
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>

					{/* Education */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<GraduationCap className="h-5 w-5" />
								Education
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{educations.length === 0 ? (
									<p className="text-gray-500">No education added</p>
								) : (
									educations.map((edu, index) => (
										<div key={index} className="flex items-center justify-between">
											<div>
												<h4 className="font-semibold text-gray-900">{edu.qualification}</h4>
												<p className="text-gray-600">{edu.institution}</p>
											</div>
											<div className="text-right">
												<p className="text-sm text-gray-500">{edu.completionDate}</p>
												<Badge variant={edu.completed ? "default" : "secondary"}>
													{edu.completed ? "Completed" : "In Progress"}
												</Badge>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>

					{/* Skills */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Code className="h-5 w-5" />
								Skills
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{/* Computer Skills */}
								{skills.computerSkills.length > 0 && (
									<div>
										<h4 className="mb-3 font-medium text-gray-900">Computer Skills</h4>
										<div className="flex flex-wrap gap-2">
											{skills.computerSkills.map((skill) => (
												<Badge key={skill} variant="outline">
													{skill}
												</Badge>
											))}
										</div>
									</div>
								)}

								{/* Other Skills */}
								{skills.otherSkills.length > 0 && (
									<div>
										<h4 className="mb-3 font-medium text-gray-900">Other Skills</h4>
										<div className="flex flex-wrap gap-2">
											{skills.otherSkills.map((skill) => (
												<Badge key={skill} variant="outline">
													{skill}
												</Badge>
											))}
										</div>
									</div>
								)}

								{/* Skills Matrix */}
								{skills.skillsMatrix.length > 0 && (
									<div>
										<h4 className="mb-3 font-medium text-gray-900">Skills Matrix</h4>
										<div className="grid gap-4">
											{skills.skillsMatrix.map((skill, index) => (
												<div key={index} className="rounded-lg border p-4">
													<div className="mb-2 flex items-center justify-between">
														<h5 className="font-medium text-gray-900">{skill.skill}</h5>
														<Badge variant="secondary">{skill.proficiency}</Badge>
													</div>
													<div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
														<div>Years Experience: {skill.yearsExperience}</div>
														<div>Last Used: {skill.lastUsed}</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{skills.computerSkills.length === 0 &&
									skills.otherSkills.length === 0 &&
									skills.skillsMatrix.length === 0 && (
										<p className="text-gray-500">No skills added</p>
									)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
