"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { Eye, Trash2, Search, Download } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmation } from "./delete-confirmation";

interface JobSeekersTableProps {
  jobSeekers: Doc<"jobSeekers">[];
}

export function JobSeekersTable({ jobSeekers }: JobSeekersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<Id<"jobSeekers"> | null>(null);

  const deleteJobSeeker = useMutation(api.jobSeekers.deleteJobSeeker);

  const filteredJobSeekers = jobSeekers.filter((js) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      js.firstName.toLowerCase().includes(searchLower) ||
      js.lastName.toLowerCase().includes(searchLower) ||
      js.email.toLowerCase().includes(searchLower) ||
      js.ethnicity.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (id: Id<"jobSeekers">) => {
    setDeletingId(id);
    try {
      await deleteJobSeeker({ id });
      toast.success("Job seeker deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job seeker");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, ethnicity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredJobSeekers.length} of {jobSeekers.length} job seekers
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ethnicity</TableHead>
              <TableHead>Salary Range</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobSeekers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No job seekers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobSeekers.map((jobSeeker) => (
                <TableRow key={jobSeeker._id}>
                  <TableCell className="font-medium">
                    {jobSeeker.firstName} {jobSeeker.lastName}
                  </TableCell>
                  <TableCell>{jobSeeker.email}</TableCell>
                  <TableCell>{jobSeeker.ethnicity}</TableCell>
                  <TableCell>{jobSeeker.currentSalaryRange}</TableCell>
                  <TableCell>
                    {format(new Date(jobSeeker._creationTime), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {jobSeeker.cvUploadPath && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={jobSeeker.cvUploadPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download CV"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/job-seekers/${jobSeeker._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteConfirmation
                        title="Delete Job Seeker"
                        description={`Are you sure you want to delete ${jobSeeker.firstName} ${jobSeeker.lastName}? This action cannot be undone.`}
                        onConfirm={() => handleDelete(jobSeeker._id)}
                        isLoading={deletingId === jobSeeker._id}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
