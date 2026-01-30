"use client";

import Link from "next/link";
import { Users, BookOpen, FileText } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { JobSeekersCVTable } from "@/components/cv/job-seekers-cv-table";
import { StandaloneCVsTable } from "@/components/cv/standalone-cvs-table";
import { BlobCVsTable } from "@/components/cv/blob-cvs-table";
import { AddJobSeekerDialog } from "@/components/cv/add-job-seeker-dialog";

export default function CVLibraryPage() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold">CV Library</h1>
					<p className="text-muted-foreground">Job seekers, standalone CVs, and uploaded files</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button asChild>
						<Link href="/dashboard/curriculum-vitae/new">Create New CV</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/dashboard/curriculum-vitae/new/ai-extract">AI Extract</Link>
					</Button>
					<AddJobSeekerDialog />
				</div>
			</div>

			<Tabs defaultValue="job-seekers" className="space-y-4">
				<TabsList className="grid w-full max-w-md grid-cols-3">
					<TabsTrigger value="job-seekers" className="gap-2">
						<Users className="h-4 w-4" />
						<span className="hidden sm:inline">Job Seekers</span>
						<span className="sm:hidden">Seekers</span>
					</TabsTrigger>
					<TabsTrigger value="standalone" className="gap-2">
						<BookOpen className="h-4 w-4" />
						<span className="hidden sm:inline">Standalone CVs</span>
						<span className="sm:hidden">CVs</span>
					</TabsTrigger>
					<TabsTrigger value="uploaded" className="gap-2">
						<FileText className="h-4 w-4" />
						<span className="hidden sm:inline">Uploaded Files</span>
						<span className="sm:hidden">Files</span>
					</TabsTrigger>
				</TabsList>
				<TabsContent value="job-seekers" className="space-y-4">
					<JobSeekersCVTable />
				</TabsContent>
				<TabsContent value="standalone" className="space-y-4">
					<StandaloneCVsTable />
				</TabsContent>
				<TabsContent value="uploaded" className="space-y-4">
					<BlobCVsTable />
				</TabsContent>
			</Tabs>
		</div>
	);
}
