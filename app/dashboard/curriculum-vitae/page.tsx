"use client";

import { BookOpen, Users } from "lucide-react";
import Link from "next/link";

import { AddJobSeekerDialog } from "@/components/cv/add-job-seeker-dialog";
import { JobSeekersCVTable } from "@/components/cv/job-seekers-cv-table";
import { StandaloneCVsTable } from "@/components/cv/standalone-cvs-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CVLibraryPage() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold">CV Library</h1>
					<p className="text-muted-foreground">Manage job seekers and standalone CVs</p>
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
				<TabsList className="grid w-full max-w-md grid-cols-2">
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
				</TabsList>
				<TabsContent value="job-seekers" className="space-y-4">
					<JobSeekersCVTable />
				</TabsContent>
				<TabsContent value="standalone" className="space-y-4">
					<StandaloneCVsTable />
				</TabsContent>
			</Tabs>
		</div>
	);
}
