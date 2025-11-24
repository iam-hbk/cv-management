import { Button } from "@/components/ui/button";
import { CVCard } from "@/components/dashboard/cv-card";
import { Brain, Plus } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCVs } from "@/lib/cv";
export type DashboardCV = Awaited<ReturnType<typeof getCVs>>[number];
// Temporary mock data until we have a database


export default async function Dashboard() {
  // Get CVs from database
  const dbCVs = await getCVs();

  // Combine real and mock data
  const allCVs = [...dbCVs];

  // Sort CVs by date and separate the most recent
  const sortedCVs = allCVs.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const [mostRecent, ...otherCVs] = sortedCVs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recent CVs</h1>
        <div className="flex items-center gap-2">
          
        <Link href="/dashboard/curriculum-vitae/new">
          
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create New CV
          </Button>
        </Link>
        <Link href="/dashboard/curriculum-vitae/new/ai-extract">
          <Button>
            <Brain className="mr-2 h-4 w-4" />
            AI-Extract
          </Button>
        </Link>
        </div>
      </div>

      {mostRecent && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">Most Recent CV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <CVCard cv={mostRecent} />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {mostRecent.formData.executiveSummary}
                </p>
                <div>
                  <h3 className="mb-2 font-semibold">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...mostRecent.formData.skills.computerSkills,
                      ...mostRecent.formData.skills.otherSkills,
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {otherCVs.map((cv) => (
          <CVCard key={cv.id} cv={cv} />
        ))}
      </div>

      {allCVs.length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed">
          <p className="text-muted-foreground">No CVs created yet</p>
          <Link href="/dashboard/curriculum-vitae/new">
            <Button variant="link" className="mt-2">
              Create your first CV
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
