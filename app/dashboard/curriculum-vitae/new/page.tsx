"use client";

import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { PersonalInfoForm } from "../../../../components/CVForm/PersonalInfoForm";
import { WorkExperienceForm } from "../../../../components/CVForm/WorkExperienceForm";
import { EducationForm } from "../../../../components/CVForm/EducationForm";
import { SkillsForm } from "../../../../components/CVForm/SkillsForm";
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
} from "../../../../store/cv-form-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
	PersonalInfoSchema,
	WorkExperienceSchema,
	EducationSchema,
	SkillsSchema,
	ExecutiveSummarySchema,
	CVFormData,
	Cv,
} from "../../../../schemas/cv.schema";
import { cn } from "../../../../lib/utils";
import { useSaveDraftMutation, useSubmitCVMutation } from "../../../../queries/cv";
import { ExecutiveSummaryForm } from "../../../../components/CVForm/ExecutiveSummary";
import { Loader } from "lucide-react";
import { DraftCV } from "../../../../db/schema";
import { Badge } from "../../../../components/ui/badge";

export default function NewCVPage() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
	const [executiveSummary, setExecutiveSummary] = useAtom(executiveSummaryAtom);
	const [personalInfo, setPersonalInfo] = useAtom(personalInfoAtom);
	const [skills, setSkills] = useAtom(skillsAtom);
	const resetForm = useSetAtom(resetFormAtom);
	const [steps] = useAtom(stepsAtom);
	const updateStepCompletion = useSetAtom(updateStepCompletionAtom);
	const [workExperience, setWorkExperience] = useAtom(workExperienceAtom);
	const [education, setEducation] = useAtom(educationAtom);

	const saveDraftMutation = useSaveDraftMutation();
	const submitCVMutation = useSubmitCVMutation();

	// Load AI-extracted CV data from sessionStorage
	useEffect(() => {
		const loadAIExtractedData = () => {
			if (typeof window === "undefined") return;

			const aiExtractedCV = sessionStorage.getItem("aiExtractedCV");
			if (!aiExtractedCV) return;

			try {
				const extractedData: Cv = JSON.parse(aiExtractedCV);

				// Load personal info
				setPersonalInfo({
					firstName: extractedData.personalInfo.firstName,
					lastName: extractedData.personalInfo.lastName,
					email: extractedData.personalInfo.email,
					phone: extractedData.personalInfo.phone,
					profession: extractedData.personalInfo.profession,
					location: extractedData.personalInfo.location,
					gender: extractedData.personalInfo.gender as "male" | "female" | "other",
					availability: extractedData.personalInfo.availability,
					nationality: extractedData.personalInfo.nationality,
					currentSalary: extractedData.personalInfo.currentSalary,
					expectedSalary: extractedData.personalInfo.expectedSalary,
					driversLicense: extractedData.personalInfo.driversLicense,
					idNumber: extractedData.personalInfo.idNumber,
				});
				updateStepCompletion("personal");

				// Load executive summary
				setExecutiveSummary({
					executiveSummary: extractedData.executiveSummary,
					jobTitle: "Replace with the person's current or target job title",
				});
				updateStepCompletion("executiveSummary");

				// Load work experience
				if (extractedData.workHistory.experiences.length > 0) {
					setWorkExperience({
						type: "set",
						data: extractedData.workHistory.experiences,
					});
					updateStepCompletion("work");
				}

				// Load education
				if (extractedData.education.educations.length > 0) {
					setEducation({
						type: "set",
						data: extractedData.education.educations,
					});
					updateStepCompletion("education");
				}

				// Load skills
				setSkills({
					type: "set",
					data: extractedData.skills,
				});
				updateStepCompletion("skills");

				// Clear the sessionStorage after loading
				sessionStorage.removeItem("aiExtractedCV");
				toast.success("CV data loaded successfully!");
			} catch (error) {
				console.error("Error loading AI-extracted CV:", error);
				toast.error("Failed to load extracted CV data");
			}
		};

		loadAIExtractedData();
	}, [
		setPersonalInfo,
		setExecutiveSummary,
		setWorkExperience,
		setEducation,
		setSkills,
		updateStepCompletion,
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
		try {
			const cvData: CVFormData = {
				executiveSummary: "",
				personalInfo,
				workHistory: { experiences: workExperience },
				education: { educations: education },
				skills,
			};

			await submitCVMutation.mutateAsync(cvData);
			toast.success("CV generated successfully!");
			resetForm();
			router.push("/dashboard");
		} catch (error) {
			toast.error("Failed to generate CV. Please try again.", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		}
	};

	const handleSaveDraft = async () => {
		try {
			const cvData: CVFormData = {
				executiveSummary: executiveSummary.executiveSummary,
				personalInfo,
				workHistory: { experiences: workExperience },
				education: { educations: education },
				skills,
			};
			const draftCV: DraftCV = {
				formData: cvData,
				jobTitle: executiveSummary.jobTitle,
			};

			await saveDraftMutation.mutateAsync(draftCV);
			toast.success("Draft saved successfully!");
			resetForm();
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
						<h3 className="text-lg font-medium">Preview Your CV</h3>

						{/* Executive Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									Executive Summary
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="leading-relaxed text-muted-foreground">
									{executiveSummary.executiveSummary}
								</p>
							</CardContent>
						</Card>

						{/* Personal Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									Personal Information
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div className="space-y-4">
										<div>
											<h4 className="font-medium text-foreground">Full Name</h4>
											<p className="text-muted-foreground">
												{personalInfo.firstName} {personalInfo.lastName}
											</p>
										</div>
										<div>
											<h4 className="font-medium text-foreground">Email</h4>
											<p className="text-muted-foreground">{personalInfo.email}</p>
										</div>
										<div>
											<h4 className="font-medium text-foreground">Phone</h4>
											<p className="text-muted-foreground">{personalInfo.phone}</p>
										</div>
										<div>
											<h4 className="font-medium text-foreground">Location</h4>
											<p className="text-muted-foreground">{personalInfo.location}</p>
										</div>
									</div>
									<div className="space-y-4">
										<div>
											<h4 className="font-medium text-foreground">Profession</h4>
											<p className="text-muted-foreground">{personalInfo.profession}</p>
										</div>
										<div>
											<h4 className="font-medium text-foreground">Nationality</h4>
											<p className="text-muted-foreground">{personalInfo.nationality}</p>
										</div>
										<div>
											<h4 className="font-medium text-foreground">Availability</h4>
											<p className="text-muted-foreground">{personalInfo.availability}</p>
										</div>
										<div>
											<h4 className="font-medium text-foreground">Driver&apos;s License</h4>
											<p className="text-muted-foreground">
												{personalInfo.driversLicense ? "Yes" : "No"}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Work Experience */}
						{workExperience.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 10v10l8 4"
											/>
										</svg>
										Work Experience
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{workExperience.map((exp, index) => (
											<div key={index} className="border-l-2 border-primary pl-4">
												<div className="mb-2 flex items-center justify-between">
													<h4 className="font-semibold text-foreground">{exp.position}</h4>
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														{exp.startDate} - {exp.endDate || "Present"}
														{exp.current && <Badge variant="secondary">Current</Badge>}
													</div>
												</div>
												<p className="mb-2 font-medium text-muted-foreground">{exp.company}</p>
												{exp.duties.length > 0 && (
													<ul className="list-inside list-disc space-y-1 text-muted-foreground">
														{exp.duties.map((duty: string, dutyIndex: number) => (
															<li key={dutyIndex} className="text-sm">
																{duty}
															</li>
														))}
													</ul>
												)}
												{exp.reasonForLeaving && (
													<p className="mt-2 text-sm italic text-muted-foreground">
														Reason for leaving: {exp.reasonForLeaving}
													</p>
												)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Education */}
						{education.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 6.253v13m0-13C6.5 6.5 2 10.5 2 15.5S6.5 24.5 12 24.5s10-4 10-9-4.5-9-10-9z"
											/>
										</svg>
										Education
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{education.map((edu, index) => (
											<div key={index} className="flex items-center justify-between">
												<div>
													<h4 className="font-semibold text-foreground">{edu.qualification}</h4>
													<p className="text-muted-foreground">{edu.institution}</p>
												</div>
												<div className="text-right">
													<p className="text-sm text-muted-foreground">{edu.completionDate}</p>
													<Badge variant={edu.completed ? "default" : "secondary"}>
														{edu.completed ? "Completed" : "In Progress"}
													</Badge>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Skills */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10 20l4-16m4 4l4 4m0 6V4m0 0L8 4m6 16v-2m0 0l-4-4"
										/>
									</svg>
									Skills
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									{/* Computer Skills */}
									{skills.computerSkills.length > 0 && (
										<div>
											<h4 className="mb-3 font-medium text-foreground">Computer Skills</h4>
											<div className="flex flex-wrap gap-2">
												{skills.computerSkills.map((skill: string) => (
													<Badge key={skill} variant="outline">
														{skill}
													</Badge>
												))}
											</div>
										</div>
									)}

									{/* Other Skills */}
									{skills.otherSkills.length > 0 && (
										<div>
											<h4 className="mb-3 font-medium text-foreground">Other Skills</h4>
											<div className="flex flex-wrap gap-2">
												{skills.otherSkills.map((skill: string) => (
													<Badge key={skill} variant="outline">
														{skill}
													</Badge>
												))}
											</div>
										</div>
									)}

									{/* Skills Matrix */}
									{skills.skillsMatrix.length > 0 && (
										<div>
											<h4 className="mb-3 font-medium text-foreground">Skills Matrix</h4>
											<div className="grid gap-4">
												{skills.skillsMatrix.map(
													(skill: SkillsSchema["skillsMatrix"][0], index: number) => (
														<div key={index} className="rounded-lg border p-4">
															<div className="mb-2 flex items-center justify-between">
																<h5 className="font-medium text-foreground">{skill.skill}</h5>
																<Badge variant="secondary">{skill.proficiency}</Badge>
															</div>
															<div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
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
				);
			default:
				return null;
		}
	};

	return (
		<div className="container mx-auto max-w-4xl space-y-8 py-6">
			<div className="space-y-0.5">
				<h2 className="text-2xl font-bold tracking-tight">Create New CV</h2>
				<p className="text-muted-foreground">
					Complete each section to generate your professional CV.
				</p>
			</div>

			{/* Progress Bar */}
			<div className="relative">
				<div className="flex items-center justify-between">
					{steps.map((step, index) => (
						<div
							onClick={() => setCurrentStep(index)}
							key={step.id}
							className="group flex cursor-pointer flex-col items-center gap-2"
						>
							<div
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-200",
									{
										"border-primary bg-primary text-primary-foreground": index === currentStep,
										"border-green-500 bg-green-500 text-white":
											step.isCompleted && index !== currentStep,
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
										"group-hover:text-green-500": step.isCompleted,
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
									<Loader className="h-4 w-4 animate-spin" /> Saving CV
								</>
							) : (
								"Save & Continue"
							)}
						</Button>
					) : null}
				</div>
			</div>
		</div>
	);
}
