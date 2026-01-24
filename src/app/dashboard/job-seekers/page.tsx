"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { JobSeekersTable } from "@/components/admin/job-seekers-table";

export default function JobSeekersPage() {
  const jobSeekers = useQuery(api.jobSeekers.getAllJobSeekers);

  const isLoading = jobSeekers === undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Job Seekers</h1>
          <p className="text-muted-foreground">
            Manage job seeker submissions and CV downloads
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="rounded-md border">
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <JobSeekersTable jobSeekers={jobSeekers} />
      )}
    </div>
  );
}
