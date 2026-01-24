"use client";

import { format } from "date-fns";
import { Download, Mail, Phone, User, MapPin, Banknote } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface JobSeekerDetailProps {
  jobSeeker: Doc<"jobSeekers">;
}

export function JobSeekerDetail({ jobSeeker }: JobSeekerDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Full Name
            </p>
            <p className="text-lg">
              {jobSeeker.firstName} {jobSeeker.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Nationality
            </p>
            <p className="text-lg">{jobSeeker.nationality}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              ID Number
            </p>
            <p className="text-lg">{jobSeeker.idNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Ethnicity
            </p>
            <p className="text-lg">{jobSeeker.ethnicity}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">
              <a
                href={`mailto:${jobSeeker.email}`}
                className="text-primary hover:underline"
              >
                {jobSeeker.email}
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Mobile Number
            </p>
            <p className="text-lg">
              <a
                href={`tel:${jobSeeker.mobileNumber}`}
                className="text-primary hover:underline"
              >
                {jobSeeker.mobileNumber}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Salary Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Current Salary Rate
            </p>
            <p className="text-lg">{jobSeeker.currentSalaryRate}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Current Salary Range
            </p>
            <p className="text-lg">{jobSeeker.currentSalaryRange}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobSeeker.cvUploadPath ? (
            <Button asChild>
              <a
                href={jobSeeker.cvUploadPath}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CV
              </a>
            </Button>
          ) : (
            <p className="text-muted-foreground">No CV uploaded</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Submitted on{" "}
            {format(new Date(jobSeeker._creationTime), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
