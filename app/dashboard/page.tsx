"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { Users, Briefcase, Clock, ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { StatusBadge } from "../../components/admin/status-badge";

export default function Dashboard() {
  const jobSeekers = useQuery(api.jobSeekers.getAllJobSeekers);
  const vacancies = useQuery(api.vacancies.getAllVacancies);
  const pendingVacancies = useQuery(api.vacancies.getPendingVacancies);

  const isLoading = !jobSeekers || !vacancies || !pendingVacancies;

  // Calculate submissions in the last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentJobSeekers = jobSeekers?.filter(
    (js) => js._creationTime > sevenDaysAgo
  ).length ?? 0;
  const recentVacancies = vacancies?.filter(
    (v) => v.createdAt > sevenDaysAgo
  ).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the IntoBeing Placements Admin Panel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Vacancies
            </CardTitle>
            <Briefcase className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">
                {pendingVacancies.length}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Job Seekers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{jobSeekers.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Registered candidates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vacancies
            </CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{vacancies.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              All job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last 7 Days
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {recentJobSeekers + recentVacancies}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              New submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Vacancies</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/vacancies">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : pendingVacancies.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No pending vacancies
              </p>
            ) : (
              <div className="space-y-3">
                {pendingVacancies.slice(0, 5).map((vacancy) => (
                  <Link
                    key={vacancy._id}
                    href={`/dashboard/vacancies/${vacancy._id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{vacancy.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {vacancy.companyName}
                      </p>
                    </div>
                    <StatusBadge status={vacancy.status} />
                  </Link>
                ))}
                {pendingVacancies.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{pendingVacancies.length - 5} more pending
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Job Seekers</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/job-seekers">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : jobSeekers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No job seekers yet
              </p>
            ) : (
              <div className="space-y-3">
                {jobSeekers.slice(0, 5).map((jobSeeker) => (
                  <Link
                    key={jobSeeker._id}
                    href={`/dashboard/job-seekers/${jobSeeker._id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {jobSeeker.firstName} {jobSeeker.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {jobSeeker.email}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {jobSeeker.currentSalaryRange}
                    </span>
                  </Link>
                ))}
                {jobSeekers.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{jobSeekers.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
