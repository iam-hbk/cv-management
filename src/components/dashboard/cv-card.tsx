import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Brain, FileEdit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardCV } from "@/app/dashboard/page";

export function CVCard({ cv }: { cv: DashboardCV }) {
  // Get the first 3 skills combining computer and other skills
  const displaySkills = [
    ...(cv.formData?.skills.computerSkills ?? []),
    ...(cv.formData?.skills.otherSkills ?? []),
  ].slice(0, 3);

  return (
    <Link href={`/dashboard/cv/${cv.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1">{cv.jobTitle}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={cv.status === "completed" ? "default" : "secondary"}
                className="border-primary text-xs"
              >
                {cv.status}
              </Badge>
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
              {formatDistanceToNow(cv.createdAt ?? new Date(), {
                addSuffix: true,
              })}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{cv.formData?.personalInfo.profession}</span>•
            <span>{cv.formData?.personalInfo.location}</span>
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
            {cv.formData?.skills.computerSkills.length +
              cv.formData?.skills.otherSkills.length >
              3 && (
              <span className="text-xs text-muted-foreground">
                +
                {cv.formData?.skills.computerSkills.length +
                  cv.formData?.skills.otherSkills.length -
                  3}{" "}
                more
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
