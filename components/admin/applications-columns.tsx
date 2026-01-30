"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Eye,
	MoreHorizontal,
	Trash2,
	User,
	Briefcase,
	CheckCircle,
	XCircle,
	Star,
	Award,
	FileText,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { Doc, Id } from "@/convex/_generated/dataModel";

export type ApplicationWithDetails = Doc<"applications"> & {
	jobSeeker?: Doc<"jobSeekers"> | null;
	vacancy?: Doc<"vacancies"> | null;
};

export type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";

interface ApplicationColumnsProps {
	onStatusChange?: (id: Id<"applications">, status: ApplicationStatus) => void;
	onDelete?: (id: Id<"applications">) => void;
	isLoading?: boolean;
}

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
	pending: {
		label: "Pending",
		className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
	},
	reviewed: {
		label: "Reviewed",
		className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
	},
	shortlisted: {
		label: "Shortlisted",
		className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
	},
	rejected: {
		label: "Rejected",
		className: "bg-red-100 text-red-800 hover:bg-red-100",
	},
	hired: {
		label: "Hired",
		className: "bg-green-100 text-green-800 hover:bg-green-100",
	},
};

export function ApplicationStatusBadge({
	status,
	className,
}: {
	status: ApplicationStatus;
	className?: string;
}) {
	const config = statusConfig[status];

	return (
		<Badge variant="secondary" className={`${config.className} ${className}`}>
			{config.label}
		</Badge>
	);
}

export const applicationColumns = ({
	onStatusChange,
	onDelete,
	isLoading,
}: ApplicationColumnsProps): ColumnDef<ApplicationWithDetails, any>[] => [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "jobSeeker",
		header: "Applicant",
		cell: ({ row }) => {
			const jobSeeker = row.original.jobSeeker;
			if (!jobSeeker) return <span className="text-muted-foreground">Unknown</span>;

			return (
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
						<User className="h-4 w-4 text-primary" />
					</div>
					<div className="flex flex-col">
						<span className="font-medium">
							{jobSeeker.firstName} {jobSeeker.lastName}
						</span>
						<span className="text-sm text-muted-foreground">{jobSeeker.email}</span>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "vacancy",
		header: "Position",
		cell: ({ row }) => {
			const vacancy = row.original.vacancy;
			if (!vacancy) return <span className="text-muted-foreground">Unknown</span>;

			return (
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
						<Briefcase className="h-4 w-4 text-secondary-foreground" />
					</div>
					<div className="flex flex-col">
						<span className="font-medium">{vacancy.jobTitle}</span>
						<span className="text-sm text-muted-foreground">{vacancy.companyName}</span>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as ApplicationStatus;
			return <ApplicationStatusBadge status={status} />;
		},
	},
	{
		accessorKey: "createdAt",
		header: "Applied On",
		cell: ({ row }) => {
			const createdAt = row.getValue("createdAt") as number;
			return (
				<span className="text-sm text-muted-foreground">
					{format(new Date(createdAt), "MMM d, yyyy")}
				</span>
			);
		},
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const application = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem asChild>
							<Link href={`/dashboard/applications/${application._id}`}>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</Link>
						</DropdownMenuItem>
						{application.jobSeeker?.cvUploadPath && (
							<DropdownMenuItem asChild>
								<a
									href={application.jobSeeker.cvUploadPath}
									target="_blank"
									rel="noopener noreferrer"
								>
									<FileText className="mr-2 h-4 w-4" />
									Download CV
								</a>
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuLabel>Change Status</DropdownMenuLabel>
						<DropdownMenuItem
							onClick={() => onStatusChange?.(application._id, "reviewed")}
							disabled={isLoading}
						>
							<CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
							Mark as Reviewed
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onStatusChange?.(application._id, "shortlisted")}
							disabled={isLoading}
						>
							<Star className="mr-2 h-4 w-4 text-purple-500" />
							Mark as Shortlisted
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onStatusChange?.(application._id, "hired")}
							disabled={isLoading}
						>
							<Award className="mr-2 h-4 w-4 text-green-500" />
							Mark as Hired
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onStatusChange?.(application._id, "rejected")}
							disabled={isLoading}
							className="text-destructive"
						>
							<XCircle className="mr-2 h-4 w-4" />
							Mark as Rejected
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => onDelete?.(application._id)}
							disabled={isLoading}
							className="text-destructive"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
