"use client";

import Link from "next/link";
import { Brain, FileEdit, Eye, Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface BuiltCV {
  id: string;
  jobTitle: string;
  createdAt: Date;
  createdBy: { name: string; email: string };
  formData?: {
    personalInfo?: { profession?: string; location?: string };
    skills?: { computerSkills?: string[]; otherSkills?: string[] };
  };
  status?: string;
  isAiAssisted?: boolean;
}

interface CVCardProps {
  cv: BuiltCV;
}

export function CVCard({ cv }: CVCardProps) {
  const displaySkills = [
    ...(cv.formData?.skills?.computerSkills ?? []),
    ...(cv.formData?.skills?.otherSkills ?? []),
  ].slice(0, 3);

  return (
    <Card className="flex flex-col transition-colors hover:bg-muted/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{cv.jobTitle}</CardTitle>
          <div className="flex items-center gap-2">
            {cv.status && (
              <Badge
                variant={cv.status === "completed" ? "default" : "secondary"}
                className="border-primary text-xs"
              >
                {cv.status}
              </Badge>
            )}
            {cv.isAiAssisted ? (
              <Brain className="h-4 w-4 text-muted-foreground" />
            ) : (
              <FileEdit className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <CardDescription className="flex flex-col gap-1">
          <span>By {cv.createdBy.name}</span>
          <span className="text-xs">
            Created{" "}
            {formatDistanceToNow(
              cv.createdAt instanceof Date ? cv.createdAt : new Date(cv.createdAt),
              { addSuffix: true }
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-2 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{cv.formData?.personalInfo?.profession ?? "—"}</span>
          <span>•</span>
          <span>{cv.formData?.personalInfo?.location ?? "—"}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {displaySkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
            >
              {skill}
            </span>
          ))}
          {(cv.formData?.skills?.computerSkills?.length ?? 0) +
            (cv.formData?.skills?.otherSkills?.length ?? 0) >
            3 && (
            <span className="text-xs text-muted-foreground">
              +
              {(cv.formData?.skills?.computerSkills?.length ?? 0) +
                (cv.formData?.skills?.otherSkills?.length ?? 0) -
                3}{" "}
              more
            </span>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="default" size="sm" asChild>
            <Link href={`/dashboard/curriculum-vitae/view/${cv.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/curriculum-vitae/edit/${cv.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
