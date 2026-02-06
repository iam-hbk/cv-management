"use client";

import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { ApplicationStatusBadge } from "@/components/admin/applications-columns";
import { DeleteConfirmation } from "@/components/admin/delete-confirmation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
	ArrowLeft,
	Award,
	Briefcase,
	CheckCircle,
	Download,
	FileOutput,
	Palette,
	Sparkles,
	Star,
	Trash2,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Type definition for application with details
type ApplicationWithDetails = {
	application: {
		_id: Id<"applications">;
		vacancyId: Id<"vacancies">;
		jobSeekerId: Id<"jobSeekers">;
		status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
		createdAt: number;
		updatedAt: number;
	};
	jobSeeker: {
		_id: Id<"jobSeekers">;
		firstName: string;
		lastName: string;
		email: string;
		mobileNumber: string;
		nationality: string;
		ethnicity: string;
		currentSalaryRate: string;
		currentSalaryRange: string;
		cvUploadPath: string;
		_idNumber: string;
	} | null;
	vacancy: {
		_id: Id<"vacancies">;
		jobTitle: string;
		companyName: string;
		jobDescription: string;
		jobRegion: string;
		workingModel: string;
		jobNiche: string;
		postedBy: string;
		postedByEmail: string;
		postedByMobile: string;
	} | null;
	activityLogs: Doc<"activityLogs">[];
};

export default function ApplicationDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as Id<"applications">;

	const applicationData = useQuery(api.applications.getApplicationByIdWithDetails, { id });

	const updateStatus = useMutation(api.applications.updateApplicationStatus);
	const deleteApplication = useMutation(api.applications.deleteApplication);
	const sendStatusEmail = useAction(api.applicationsActions.sendApplicationStatusEmail);

	const isLoading = applicationData === undefined;

	const handleStatusChange = async (
		status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired"
	) => {
		try {
			await updateStatus({ id, status, performedBy: "admin" });
			await sendStatusEmail({ applicationId: id, status });
			toast.success(`Application marked as ${status}`);
		} catch (error) {
			toast.error("Failed to update status");
			console.error(error);
		}
	};

	const handleDelete = async () => {
		try {
			await deleteApplication({ id, performedBy: "admin" });
			toast.success("Application deleted successfully");
			router.push("/dashboard/applications");
		} catch (error) {
			toast.error("Failed to delete application");
			console.error(error);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-10" />
					<Skeleton className="h-8 w-64" />
				</div>
				<div className="space-y-4">
					{[...Array(4)].map((_, i) => (
						<Skeleton key={`skeleton-${i}`} className="h-32 w-full" />
					))}
				</div>
			</div>
		);
	}

	if (!applicationData || !applicationData.application) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<h2 className="text-2xl font-bold">Application Not Found</h2>
				<p className="text-muted-foreground mb-4">
					The application you're looking for doesn't exist.
				</p>
				<Button asChild>
					<Link href="/dashboard/applications">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Applications
					</Link>
				</Button>
			</div>
		);
	}

	const { application, jobSeeker, vacancy, activityLogs } =
		applicationData as ApplicationWithDetails;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/dashboard/applications">
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold">
								{jobSeeker?.firstName} {jobSeeker?.lastName}
							</h1>
							<ApplicationStatusBadge status={application.status} />
						</div>
						<p className="text-muted-foreground">
							Applied for {vacancy?.jobTitle} at {vacancy?.companyName}
						</p>
					</div>
				</div>
				<DeleteConfirmation
					title="Delete Application"
					description={`Are you sure you want to delete this application from ${jobSeeker?.firstName} ${jobSeeker?.lastName}? This action cannot be undone.`}
					onConfirm={handleDelete}
					trigger={
						<Button variant="destructive">
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					}
				/>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Applicant Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Briefcase className="h-5 w-5" />
							Applicant Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-muted-foreground">Full Name</p>
								<p className="font-medium">
									{jobSeeker?.firstName} {jobSeeker?.lastName}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Email</p>
								<a
									href={`mailto:${jobSeeker?.email}`}
									className="font-medium text-primary hover:underline"
								>
									{jobSeeker?.email}
								</a>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Mobile</p>
								<a
									href={`tel:${jobSeeker?.mobileNumber}`}
									className="font-medium text-primary hover:underline"
								>
									{jobSeeker?.mobileNumber}
								</a>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Nationality</p>
								<p className="font-medium">{jobSeeker?.nationality}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Ethnicity</p>
								<p className="font-medium">{jobSeeker?.ethnicity}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Salary Range</p>
								<p className="font-medium">{jobSeeker?.currentSalaryRange}</p>
							</div>
						</div>
						<Separator />
						{jobSeeker?.cvUploadPath && (
							<div className="space-y-2">
								<Button asChild className="w-full">
									<a href={jobSeeker.cvUploadPath} target="_blank" rel="noopener noreferrer">
										<Download className="mr-2 h-4 w-4" />
										Download CV
									</a>
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" className="w-full">
											<FileOutput className="mr-2 h-4 w-4" />
											CV Actions
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-56">
										<DropdownMenuLabel>Process CV</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link
												href={`/dashboard/curriculum-vitae/new/ai-extract?source=job-seeker&id=${jobSeeker._id}`}
											>
												<Sparkles className="mr-2 h-4 w-4 text-purple-500" />
												AI Extract CV
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href={`/dashboard/curriculum-vitae/new/ai-extract?source=job-seeker&id=${jobSeeker._id}&mode=branding`}
											>
												<Palette className="mr-2 h-4 w-4 text-blue-500" />
												Convert to Branding
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href={`/dashboard/curriculum-vitae/new/ai-extract?source=job-seeker&id=${jobSeeker._id}&mode=extract-branding`}
											>
												<FileOutput className="mr-2 h-4 w-4 text-green-500" />
												AI Extract + Branding
											</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Vacancy Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Briefcase className="h-5 w-5" />
							Position Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground">Job Title</p>
								<p className="font-medium">{vacancy?.jobTitle}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Company</p>
								<p className="font-medium">{vacancy?.companyName}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Region</p>
								<p className="font-medium">{vacancy?.jobRegion}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Work Model</p>
								<Badge variant="outline">{vacancy?.workingModel}</Badge>
							</div>
						</div>
						<Separator />
						<Button variant="outline" className="w-full" asChild>
							<Link href={`/dashboard/vacancies/${application.vacancyId}`}>
								View Vacancy Details
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Status Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">Update Status</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						<Button
							onClick={() => handleStatusChange("reviewed")}
							variant={application.status === "reviewed" ? "default" : "outline"}
							disabled={application.status === "reviewed"}
						>
							<CheckCircle className="mr-2 h-4 w-4" />
							Mark as Reviewed
						</Button>
						<Button
							onClick={() => handleStatusChange("shortlisted")}
							variant={application.status === "shortlisted" ? "default" : "outline"}
							disabled={application.status === "shortlisted"}
						>
							<Star className="mr-2 h-4 w-4" />
							Mark as Shortlisted
						</Button>
						<Button
							onClick={() => handleStatusChange("hired")}
							variant={application.status === "hired" ? "default" : "outline"}
							disabled={application.status === "hired"}
						>
							<Award className="mr-2 h-4 w-4" />
							Mark as Hired
						</Button>
						<Button
							onClick={() => handleStatusChange("rejected")}
							variant={application.status === "rejected" ? "destructive" : "outline"}
							disabled={application.status === "rejected"}
							className={
								application.status !== "rejected"
									? "text-destructive hover:bg-destructive hover:text-destructive-foreground"
									: ""
							}
						>
							<XCircle className="mr-2 h-4 w-4" />
							Mark as Rejected
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Activity Timeline */}
			<ActivityTimeline activityLogs={(activityLogs || []) as Doc<"activityLogs">[]} />

			{/* Meta Information */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div>Applied: {format(new Date(application.createdAt), "MMM d, yyyy 'at' h:mm a")}</div>
						{application.updatedAt !== application.createdAt && (
							<div>
								Last Updated: {format(new Date(application.updatedAt), "MMM d, yyyy 'at' h:mm a")}
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
