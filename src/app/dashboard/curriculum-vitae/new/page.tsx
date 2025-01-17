"use client";

import { useAtom, useSetAtom } from "jotai";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PersonalInfoForm } from "@/components/CVForm/PersonalInfoForm";
import { WorkExperienceForm } from "@/components/CVForm/WorkExperienceForm";
import { EducationForm } from "@/components/CVForm/EducationForm";
import { SkillsForm } from "@/components/CVForm/SkillsForm";
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
} from "@/store/cv-form-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  PersonalInfoSchema,
  WorkExperienceSchema,
  EducationSchema,
  SkillsSchema,
  ExecutiveSummarySchema,
  CVFormData,
} from "@/schemas/cv.schema";
import { cn } from "@/lib/utils";
import { useSaveDraftMutation, useSubmitCVMutation } from "@/queries/cv";
import { ExecutiveSummaryForm } from "@/components/CVForm/ExecutiveSummary";
import { Loader } from "lucide-react";
import { DraftCV } from "@/db/schema";

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

  const handleFormSubmit = async (
    step: number,
    data:
      | PersonalInfoSchema
      | WorkExperienceSchema["experiences"]
      | EducationSchema["educations"]
      | SkillsSchema
      | ExecutiveSummarySchema,
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
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
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
            <div className="space-y-4">
              <section>
                <h4 className="mb-2 font-medium">Executive Summary</h4>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
                  {JSON.stringify(executiveSummary, null, 2)}
                </pre>
              </section>
              <Separator />
              <section>
                <h4 className="mb-2 font-medium">Personal Information</h4>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
                  {JSON.stringify(personalInfo, null, 2)}
                </pre>
              </section>
              <Separator />
              <section>
                <h4 className="mb-2 font-medium">Work Experience</h4>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
                  {JSON.stringify(workExperience, null, 2)}
                </pre>
              </section>
              <Separator />
              <section>
                <h4 className="mb-2 font-medium">Education</h4>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
                  {JSON.stringify(education, null, 2)}
                </pre>
              </section>
              <Separator />
              <section>
                <h4 className="mb-2 font-medium">Skills</h4>
                <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm">
                  {JSON.stringify(skills, null, 2)}
                </pre>
              </section>
            </div>
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
                    "border-primary bg-primary text-primary-foreground":
                      index === currentStep,
                    "border-green-500 bg-green-500 text-white":
                      step.isCompleted,
                    "border-destructive bg-background text-muted-foreground":
                      !step.isCompleted && index !== currentStep,
                  },
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
                    "group-hover:text-destructive":
                      !step.isCompleted && index !== currentStep,
                    "group-hover:text-green-500": step.isCompleted,
                  },
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
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            >
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2 self-end">
          {currentStep < steps.length - 1 && (
            <Button
              variant="outline"
              onClick={() =>
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
              }
            >
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 ? (
            <Button
              disabled={submitCVMutation.isPending}
              onClick={handleFinalSubmit}
            >
              {submitCVMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" /> Generating CV
                </>
              ) : (
                "Generate CV"
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
