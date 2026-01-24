"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import { JobSeekerDetail } from "../../../../components/admin/job-seeker-detail";
import { DeleteConfirmation } from "../../../../components/admin/delete-confirmation";

export default function JobSeekerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as Id<"jobSeekers">;

  const jobSeeker = useQuery(api.jobSeekers.getJobSeekerById, { id });
  const deleteJobSeeker = useMutation(api.jobSeekers.deleteJobSeeker);

  const isLoading = jobSeeker === undefined;

  const handleDelete = async () => {
    try {
      await deleteJobSeeker({ id });
      toast.success("Job seeker deleted successfully");
      router.push("/dashboard/job-seekers");
    } catch (error) {
      toast.error("Failed to delete job seeker");
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
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (jobSeeker === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Job Seeker Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The job seeker you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/dashboard/job-seekers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Seekers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/job-seekers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {jobSeeker.firstName} {jobSeeker.lastName}
            </h1>
            <p className="text-muted-foreground">{jobSeeker.email}</p>
          </div>
        </div>
        <DeleteConfirmation
          title="Delete Job Seeker"
          description={`Are you sure you want to delete ${jobSeeker.firstName} ${jobSeeker.lastName}? This action cannot be undone.`}
          onConfirm={handleDelete}
          trigger={
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          }
        />
      </div>

      <JobSeekerDetail jobSeeker={jobSeeker} />
    </div>
  );
}
