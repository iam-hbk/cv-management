"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Edit,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useCV } from "@/hooks/use-cv";
import type {
  WorkExperienceSchema,
  EducationSchema,
  SkillsSchema,
} from "@/schemas/cv.schema";
import { use } from "react";

interface CVViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CVViewPage({ params }: CVViewPageProps) {
  const { id } = use(params);
  const { data: cv, isLoading, error, isError } = useCV(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (isError || !cv) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            {error?.message || "CV not found"}
          </p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Present";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  };

  const formatSalary = (salary: number | undefined) => {
    if (!salary) return "Not specified";
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
    }).format(salary);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="print:hidden">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {cv.jobTitle}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getStatusColor(cv.status)}
                  >
                    {cv.status}
                  </Badge>
                  {cv.isAiAssisted && (
                    <Badge variant="secondary">AI Assisted</Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    Created {formatDate(cv.createdAt)} by {cv.createdBy.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/curriculum-vitae/edit/${cv.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit CV
                </Button>
              </Link>
              <Button onClick={handlePrint} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-8">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-gray-700">
                {cv.formData.executiveSummary}
              </p>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Full Name</h4>
                    <p className="text-gray-700">
                      {cv.formData.personalInfo.firstName}{" "}
                      {cv.formData.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-700">
                        {cv.formData.personalInfo.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-700">
                        {cv.formData.personalInfo.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-700">
                        {cv.formData.personalInfo.location}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Profession</h4>
                    <p className="text-gray-700">
                      {cv.formData.personalInfo.profession}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Nationality</h4>
                    <p className="text-gray-700">
                      {cv.formData.personalInfo.nationality}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Availability</h4>
                    <p className="text-gray-700">
                      {cv.formData.personalInfo.availability}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Driver&apos;s License
                    </h4>
                    <p className="text-gray-700">
                      {cv.formData.personalInfo.driversLicense ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-gray-900">Current Salary</h4>
                  <p className="text-gray-700">
                    {formatSalary(cv.formData.personalInfo.currentSalary)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Expected Salary</h4>
                  <p className="text-gray-700">
                    {formatSalary(cv.formData.personalInfo.expectedSalary)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cv.formData.workHistory.experiences.map(
                  (
                    exp: WorkExperienceSchema["experiences"][0],
                    index: number,
                  ) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          {exp.position}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {formatDate(exp.startDate)} -{" "}
                          {formatDate(exp.endDate)}
                          {exp.current && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                      </div>
                      <p className="mb-2 font-medium text-gray-600">
                        {exp.company}
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-gray-700">
                        {exp.duties.map((duty: string, dutyIndex: number) => (
                          <li key={dutyIndex} className="text-sm">
                            {duty}
                          </li>
                        ))}
                      </ul>
                      {!exp.current && exp.reasonForLeaving && (
                        <p className="mt-2 text-sm italic text-gray-500">
                          Reason for leaving: {exp.reasonForLeaving}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cv.formData.education.educations.map(
                  (edu: EducationSchema["educations"][0], index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {edu.qualification}
                        </h4>
                        <p className="text-gray-600">{edu.institution}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {edu.completionDate}
                        </p>
                        <Badge
                          variant={edu.completed ? "default" : "secondary"}
                        >
                          {edu.completed ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Computer Skills */}
                {cv.formData.skills.computerSkills.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-medium text-gray-900">
                      Computer Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cv.formData.skills.computerSkills.map(
                        (skill: string) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Other Skills */}
                {cv.formData.skills.otherSkills.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-medium text-gray-900">
                      Other Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cv.formData.skills.otherSkills.map((skill: string) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Matrix */}
                {cv.formData.skills.skillsMatrix.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-medium text-gray-900">
                      Skills Matrix
                    </h4>
                    <div className="grid gap-4">
                      {cv.formData.skills.skillsMatrix.map(
                        (
                          skill: SkillsSchema["skillsMatrix"][0],
                          index: number,
                        ) => (
                          <div key={index} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h5 className="font-medium text-gray-900">
                                {skill.skill}
                              </h5>
                              <Badge variant="secondary">
                                {skill.proficiency}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                Years Experience: {skill.yearsExperience}
                              </div>
                              <div>Last Used: {skill.lastUsed}</div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .bg-gray-50\\/50 {
            background: white !important;
          }
          .border-b {
            border-bottom: 2px solid #000 !important;
          }
          .text-gray-900 {
            color: #000 !important;
          }
          .text-gray-700 {
            color: #333 !important;
          }
          .text-gray-600 {
            color: #555 !important;
          }
          .text-gray-500 {
            color: #666 !important;
          }
        }
      `}</style>
    </div>
  );
}
