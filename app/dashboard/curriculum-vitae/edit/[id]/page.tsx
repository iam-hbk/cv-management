"use client";

import { useAtom, useSetAtom } from "jotai";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { PersonalInfoForm } from "../../../../../components/CVForm/PersonalInfoForm";
import { WorkExperienceForm } from "../../../../../components/CVForm/WorkExperienceForm";
import { EducationForm } from "../../../../../components/CVForm/EducationForm";
import { SkillsForm } from "../../../../../components/CVForm/SkillsForm";
import {
	currentStepAtom,
	personalInfoAtom,
	skillsAtom,
	resetFormAtom,
	stepsAtom,
	updateStepCompletionAtom,
	workExperienceAtom,
	educationAtom,
	executiveSummaryAtom,
} from "../../../../../store/cv-form-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
	PersonalInfoSchema,
	WorkExperienceSchema,
	EducationSchema,
	SkillsSchema,
	ExecutiveSummarySchema,
	CVFormData,
} from "../../../../../schemas/cv.schema";
import { cn } from "../../../../../lib/utils";
import { useSubmitCVMutation } from "../../../../../queries/cv";
import { ExecutiveSummaryForm } from "../../../../../components/CVForm/ExecutiveSummary";
import { ChevronDown, Loader } from "lucide-react";
// import { DraftCV } from "@/db/schema";
import { useCV } from "../../../../../hooks/use-cv";
import { use, useEffect } from "react";
import { Badge } from "../../../../../components/ui/badge";

interface EditCVPageProps {
	params: Promise<{
		id: string;
	}>;
}
export default function EditCVPage({ params }: EditCVPageProps) {
	const router = useRouter();
	const { id } = use(params);

	const { data: cv, isLoading, error, isError, refetch } = useCV(id || "");

	// Helper function to safely format dates
	const formatDateSafe = (dateStr: string | undefined | null): string => {
		if (!dateStr || dateStr.trim() === "" || dateStr.toLowerCase() === "n/a") {
			return "N/A";
		}
		try {
			const date = new Date(dateStr);
			if (isNaN(date.getTime())) {
				return "N/A";
			}
			return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
		} catch {
			return "N/A";
		}
	};

	const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
	const [executiveSummary, setExecutiveSummary] = useAtom(executiveSummaryAtom);
	const [personalInfo, setPersonalInfo] = useAtom(personalInfoAtom);
	const [skills, setSkills] = useAtom(skillsAtom);
	const resetForm = useSetAtom(resetFormAtom);
	const [steps] = useAtom(stepsAtom);
	const updateStepCompletion = useSetAtom(updateStepCompletionAtom);
	const [workExperience, setWorkExperience] = useAtom(workExperienceAtom);
	const [education, setEducation] = useAtom(educationAtom);

	// const saveDraftMutation = useSaveDraftMutation();
	const submitCVMutation = useSubmitCVMutation();

	// Initialize form with CV data when it loads
	useEffect(() => {
		if (cv?.formData) {
			setExecutiveSummary({
				executiveSummary: cv.formData.executiveSummary,
				jobTitle: cv.jobTitle,
			});
			setPersonalInfo(cv.formData.personalInfo);
			setWorkExperience({
				type: "set",
				data: cv.formData.workHistory.experiences,
			});
			setEducation({
				type: "set",
				data: cv.formData.education.educations,
			});
			setSkills({ type: "set", data: cv.formData.skills });

			// Mark all steps as completed since we have data
			updateStepCompletion("executiveSummary");
			updateStepCompletion("personal");
			updateStepCompletion("work");
			updateStepCompletion("education");
			updateStepCompletion("skills");
		}
	}, [
		cv?.formData,
		setExecutiveSummary,
		setPersonalInfo,
		setWorkExperience,
		setEducation,
		setSkills,
		updateStepCompletion,
		cv?.jobTitle,
	]);

	const handleFormSubmit = async (
		step: number,
		data:
			| PersonalInfoSchema
			| WorkExperienceSchema["experiences"]
			| EducationSchema["educations"]
			| SkillsSchema
			| ExecutiveSummarySchema
	) => {
		try {
			switch (step) {
				case 0:
					setExecutiveSummary(data as ExecutiveSummarySchema);
					updateStepCompletion("executiveSummary");
					break;
				case 1:
					setPersonalInfo(data as PersonalInfoSchema);
					updateStepCompletion("personal");
					break;
				case 2:
					setWorkExperience({
						type: "add",
						data: data as WorkExperienceSchema["experiences"],
					});
					updateStepCompletion("work");
					break;
				case 3:
					setEducation({
						type: "add",
						data: data as EducationSchema["educations"],
					});
					updateStepCompletion("education");
					break;
				case 4:
					setSkills({
						type: "add",
						data: data as SkillsSchema,
					});
					updateStepCompletion("skills");
					break;
			}

			if (currentStep < steps.length - 1) {
				setCurrentStep(currentStep + 1);
				toast.success("Progress saved!");
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Something went wrong. Please try again.";
			toast.error(errorMessage);
		}
	};

	const handleFinalSubmit = async () => {
		if (!id) {
			toast.error("CV ID not found");
			return;
		}

		try {
			const cvData: CVFormData = {
				executiveSummary: executiveSummary.executiveSummary,
				personalInfo,
				workHistory: { experiences: workExperience },
				education: { educations: education },
				skills,
			};

			// Use the API to update the CV
			const response = await fetch(`/api/cv/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					formData: cvData,
					jobTitle: executiveSummary.jobTitle,
					status: "completed",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update CV");
			}

			toast.success("CV updated successfully!");
			resetForm();
			router.push(`/dashboard/curriculum-vitae/view/${id}`);
		} catch (error) {
			toast.error("Failed to update CV. Please try again.", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		}
	};

	const handleSaveDraft = async () => {
		if (!id) {
			toast.error("CV ID not found");
			return;
		}

		try {
			const cvData: CVFormData = {
				executiveSummary: executiveSummary.executiveSummary,
				personalInfo,
				workHistory: { experiences: workExperience },
				education: { educations: education },
				skills,
			};

			// Use the API to update the CV as draft
			const response = await fetch(`/api/cv/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					formData: cvData,
					jobTitle: executiveSummary.jobTitle,
					status: "draft",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save draft");
			}

			toast.success("Draft saved successfully!");
			router.push("/dashboard");
		} catch (error) {
			toast.error("Failed to save draft. Please try again.", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		}
	};

	const renderStep = () => {
		switch (currentStep) {
			case 0:
				return (
					<ExecutiveSummaryForm
						onSubmit={(data) => handleFormSubmit(0, data)}
						onSaveDraft={handleSaveDraft}
						initialData={executiveSummary}
					/>
				);
			case 1:
				return (
					<PersonalInfoForm
						onSubmit={(data) => handleFormSubmit(1, data)}
						onSaveDraft={handleSaveDraft}
						initialData={personalInfo}
					/>
				);
			case 2:
				return (
					<WorkExperienceForm
						onSubmit={(data) => handleFormSubmit(2, data)}
						onSaveDraft={handleSaveDraft}
						initialData={workExperience}
					/>
				);
			case 3:
				return (
					<EducationForm
						onSubmit={(data) => handleFormSubmit(3, data)}
						onSaveDraft={handleSaveDraft}
						initialData={education}
					/>
				);
			case 4:
				return (
					<SkillsForm
						onSubmit={(data) => handleFormSubmit(4, data)}
						onSaveDraft={handleSaveDraft}
						initialData={skills}
					/>
				);
			case 5:
				return (
					<div className="space-y-6">
						<h3 className="text-lg font-medium">Preview</h3>
						<div className="space-y-6">
							{/* Executive Summary */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Executive Summary</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="leading-relaxed text-gray-700">
										{executiveSummary.executiveSummary}
									</p>
								</CardContent>
							</Card>

							{/* Personal Information */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Personal Information</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<div className="space-y-4">
											<div>
												<h4 className="font-medium text-gray-900">Full Name</h4>
												<p className="text-gray-700">
													{personalInfo.firstName} {personalInfo.lastName}
												</p>
											</div>
											<div>
												<h4 className="font-medium text-gray-900">Email</h4>
												<p className="text-gray-700">{personalInfo.email}</p>
											</div>
											<div>
												<h4 className="font-medium text-gray-900">Phone</h4>
												<p className="text-gray-700">{personalInfo.phone}</p>
											</div>
											<div>
												<h4 className="font-medium text-gray-900">Location</h4>
												<p className="text-gray-700">{personalInfo.location}</p>
											</div>
										</div>
										<div className="space-y-4">
											<div>
												<h4 className="font-medium text-gray-900">Profession</h4>
												<p className="text-gray-700">{personalInfo.profession}</p>
											</div>
											<div>
												<h4 className="font-medium text-gray-900">Nationality</h4>
												<p className="text-gray-700">{personalInfo.nationality}</p>
											</div>
											<div>
												<h4 className="font-medium text-gray-900">Availability</h4>
												<p className="text-gray-700">{personalInfo.availability}</p>
											</div>
											<div>
												<h4 className="font-medium text-gray-900">Driver&apos;s License</h4>
												<p className="text-gray-700">
													{personalInfo.driversLicense ? "Yes" : "No"}
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Work Experience */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Work Experience</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{Array.isArray(workExperience) &&
											workExperience.map(
												(exp: WorkExperienceSchema["experiences"][0], index: number) => (
													<div key={index} className="border-l-2 border-gray-200 pl-4">
														<div className="mb-2 flex items-center justify-between">
															<h4 className="font-semibold text-gray-900">{exp.position}</h4>
															<div className="flex items-center gap-2 text-sm text-gray-500">
																{formatDateSafe(exp.startDate)} -{" "}
																{exp.current
																	? "Present"
																	: exp.endDate
																		? formatDateSafe(exp.endDate)
																		: "N/A"}
																{exp.current && <Badge variant="secondary">Current</Badge>}
															</div>
														</div>
														<p className="mb-2 font-medium text-gray-600">{exp.company}</p>
														{exp.duties && exp.duties.length > 0 && (
															<ul className="list-inside list-disc space-y-1 text-gray-700">
																{exp.duties.map((duty: string, dutyIndex: number) => (
																	<li key={dutyIndex} className="text-sm">
																		{duty}
																	</li>
																))}
															</ul>
														)}
														{!exp.current && exp.reasonForLeaving && (
															<p className="mt-2 text-sm italic text-gray-500">
																Reason for leaving: {exp.reasonForLeaving}
															</p>
														)}
													</div>
												)
											)}
									</div>
								</CardContent>
							</Card>

							{/* Education */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Education</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{Array.isArray(education) &&
											education.map((edu: EducationSchema["educations"][0], index: number) => (
												<div key={index} className="flex items-center justify-between">
													<div>
														<h4 className="font-semibold text-gray-900">{edu.qualification}</h4>
														<p className="text-gray-600">{edu.institution}</p>
													</div>
													<div className="text-right">
														<p className="text-sm text-gray-500">{edu.completionDate}</p>
														<Badge variant={edu.completed ? "default" : "secondary"}>
															{edu.completed ? "Completed" : "In Progress"}
														</Badge>
													</div>
												</div>
											))}
									</div>
								</CardContent>
							</Card>

							{/* Skills */}
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Skills</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{skills.computerSkills && skills.computerSkills.length > 0 && (
											<div>
												<h4 className="mb-3 font-medium text-gray-900">Computer Skills</h4>
												<div className="flex flex-wrap gap-2">
													{skills.computerSkills.map((skill: string) => (
														<Badge key={skill} variant="outline">
															{skill}
														</Badge>
													))}
												</div>
											</div>
										)}

										{skills.otherSkills && skills.otherSkills.length > 0 && (
											<div>
												<h4 className="mb-3 font-medium text-gray-900">Other Skills</h4>
												<div className="flex flex-wrap gap-2">
													{skills.otherSkills.map((skill: string) => (
														<Badge key={skill} variant="outline">
															{skill}
														</Badge>
													))}
												</div>
											</div>
										)}

										{skills.skillsMatrix && skills.skillsMatrix.length > 0 && (
											<div>
												<h4 className="mb-3 font-medium text-gray-900">Skills Matrix</h4>
												<div className="grid gap-4">
													{skills.skillsMatrix.map(
														(skill: SkillsSchema["skillsMatrix"][0], index: number) => (
															<div key={index} className="rounded-lg border p-4">
																<div className="mb-2 flex items-center justify-between">
																	<h5 className="font-medium text-gray-900">{skill.skill}</h5>
																	<Badge variant="secondary">{skill.proficiency}</Badge>
																</div>
																<div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
																	<div>Years Experience: {skill.yearsExperience}</div>
																	<div>Last Used: {skill.lastUsed}</div>
																</div>
															</div>
														)
													)}
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto max-w-4xl space-y-8 py-6">
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
						<p className="text-gray-600">Loading CV data...</p>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (isError || !cv) {
		return (
			<div className="container mx-auto max-w-4xl space-y-8 py-6">
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="text-center">
						<p className="mb-4 text-red-600">{error?.message || "CV not found"}</p>
						<div className="flex gap-2 justify-center items-center">
							<Button onClick={() => refetch()}>Try Again</Button>
							<Button variant={"outline"} onClick={() => router.push("/dashboard")}>
								Back to Dashboard
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-8 py-6">
			<div className="space-y-0.5">
				<h2 className="text-2xl font-bold tracking-tight">Edit CV</h2>
				<p className="text-muted-foreground">Update your CV information and save changes.</p>
			</div>

			{/* Progress Bar */}
			<div className="relative">
				<div className="flex items-center justify-between">
					{steps.map((step, index) => (
						<div
							onClick={() => setCurrentStep(index)}
							key={step.id}
							className="group flex cursor-pointer flex-col items-center gap-2 relative"
						>
							{index === currentStep && (
								<ChevronDown className="h-5 w-5 text-primary absolute -top-5 animate-bounce" />
							)}
							<div
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-200",
									{
										"border-primary bg-primary text-primary-foreground": index === currentStep,
										"border-green-600  text-green-600": step.isCompleted && index !== currentStep,
										"border-destructive bg-background text-muted-foreground":
											!step.isCompleted && index !== currentStep,
									}
								)}
							>
								{index + 1}
							</div>
							<span
								className={cn(
									"hidden text-sm underline-offset-4 transition-all duration-200 group-hover:font-bold group-hover:underline sm:block",
									{
										"text-foreground": index <= currentStep,
										"text-muted-foreground": index > currentStep,
										"group-hover:text-primary": index === currentStep,
										"group-hover:text-destructive": !step.isCompleted && index !== currentStep,
										"group-hover:text-green-500": step.isCompleted && index !== currentStep,
									}
								)}
							>
								{step.title}
							</span>
						</div>
					))}
				</div>
				{/* Progress line */}
				<div className="absolute left-0 right-0 top-4 -z-10 h-[2px] bg-muted">
					<div
						className="h-full bg-primary transition-all duration-200"
						style={{
							width: `${(currentStep / (steps.length - 1)) * 100}%`,
						}}
					/>
				</div>
			</div>

			{/* Form Content */}
			<Card>
				<CardContent className="pt-6">{renderStep()}</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex justify-between">
				<div className="flex gap-2">
					{currentStep > 0 && (
						<Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
							Previous
						</Button>
					)}
				</div>
				<div className="flex gap-2 self-end">
					{currentStep < steps.length - 1 && (
						<Button
							variant="outline"
							onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
						>
							Next
						</Button>
					)}
					{currentStep === steps.length - 1 ? (
						<Button disabled={submitCVMutation.isPending} onClick={handleFinalSubmit}>
							{submitCVMutation.isPending ? (
								<>
									<Loader className="h-4 w-4 animate-spin" /> Updating CV
								</>
							) : (
								"Update CV"
							)}
						</Button>
					) : null}
				</div>
			</div>
		</div>
	);
}
