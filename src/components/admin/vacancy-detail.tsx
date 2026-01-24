"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Download,
  Mail,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { StatusActions } from "./status-actions";

interface VacancyDetailProps {
  vacancy: Doc<"vacancies">;
}

export function VacancyDetail({ vacancy }: VacancyDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateVacancyStatus = useMutation(api.vacancies.updateVacancyStatus);
  const sendStatusEmail = useAction(api.vacanciesActions.sendVacancyStatusEmail);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    setIsUpdating(true);
    try {
      await updateVacancyStatus({ id: vacancy._id, status });
      await sendStatusEmail({ vacancyId: vacancy._id, status });
      toast.success(
        `Vacancy ${status === "approved" ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      toast.error(`Failed to ${status} vacancy`);
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const workingModelLabels: Record<string, string> = {
    hybrid: "Hybrid",
    "on-site": "On-Site",
    remote: "Remote",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Details
          </CardTitle>
          <StatusBadge status={vacancy.status} />
        </CardHeader>
        <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Job Title
            </p>
            <p className="text-lg font-semibold">{vacancy.jobTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Job Niche
            </p>
            <p className="text-lg">{vacancy.jobNiche}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Region</p>
            <p className="text-lg">{vacancy.jobRegion}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Working Model
            </p>
            <p className="text-lg">
              {workingModelLabels[vacancy.workingModel] || vacancy.workingModel}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">
              Job Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-base">
              {vacancy.jobDescription}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company & Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Company Name
            </p>
            <p className="text-lg">{vacancy.companyName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Posted By
            </p>
            <p className="text-lg">{vacancy.postedBy}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">
              <a
                href={`mailto:${vacancy.postedByEmail}`}
                className="text-primary hover:underline"
              >
                {vacancy.postedByEmail}
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Mobile Number
            </p>
            <p className="text-lg">
              <a
                href={`tel:${vacancy.postedByMobile}`}
                className="text-primary hover:underline"
              >
                {vacancy.postedByMobile}
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              How They Heard About Us
            </p>
            <p className="text-lg">{vacancy.postedBySource}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vacancy.vacancyFilePath ? (
            <Button asChild>
              <a
                href={vacancy.vacancyFilePath}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Vacancy File
              </a>
            </Button>
          ) : (
            <p className="text-muted-foreground">No file uploaded</p>
          )}
        </CardContent>
      </Card>

      {vacancy.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusActions
              currentStatus={vacancy.status}
              onApprove={() => handleStatusUpdate("approved")}
              onReject={() => handleStatusUpdate("rejected")}
              isLoading={isUpdating}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Created: {format(new Date(vacancy.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
            {vacancy.updatedAt !== vacancy.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Updated: {format(new Date(vacancy.updatedAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
