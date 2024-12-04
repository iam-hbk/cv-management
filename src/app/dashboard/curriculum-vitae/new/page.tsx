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
  workExperienceAtom,
  educationAtom,
  skillsAtom,
  resetFormAtom,
} from "@/store/cv-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { 
  PersonalInfoSchema, 
  WorkExperienceSchema,
  EducationSchema,
  SkillsSchema   
} from "@/schemas/cv.schema";

const steps = [
  { id: "personal", title: "Personal Information" },
  { id: "work", title: "Work Experience" },
  { id: "education", title: "Education" },
  { id: "skills", title: "Skills & Competencies" },
  { id: "preview", title: "Preview & Generate" },
] as const;

export default function NewCVPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useAtom(currentStepAtom);
  const [personalInfo, setPersonalInfo] = useAtom(personalInfoAtom);
  const [workExperience, setWorkExperience] = useAtom(workExperienceAtom);
  const [education, setEducation] = useAtom(educationAtom);
  const [skills, setSkills] = useAtom(skillsAtom);
  const resetForm = useSetAtom(resetFormAtom);

  const handleFormSubmit = async (step: number, data: PersonalInfoSchema | WorkExperienceSchema[] | EducationSchema[] | SkillsSchema) => {
    try {
      switch (step) {
        case 0:
          setPersonalInfo(data as PersonalInfoSchema);
          break;
        case 1:
          setWorkExperience({ 
            type: "add", 
            data: data as WorkExperienceSchema[]
          });
          break;
        case 2:
          setEducation({ 
            type: "add", 
            data: data as EducationSchema[]
          });
          break;
        case 3:
          setSkills({ 
            type: "add", 
            data: data as SkillsSchema 
          });
          break;
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        toast.success("Progress saved!");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const cvData = {
        personalInfo,
        workExperience,
        education,
        skills,
      };
      
      console.log("Submitting CV:", cvData);
      toast.success("CV generated successfully!");
      resetForm();
      router.push("/dashboard");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate CV. Please try again.";
      toast.error(errorMessage);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoForm 
          onSubmit={(data) => handleFormSubmit(0, data)} 
          initialData={personalInfo}
        />;
      case 1:
        return <WorkExperienceForm 
          onSubmit={(data) => handleFormSubmit(1, data)} 
          initialData={workExperience}
        />;
      case 2:
        return <EducationForm 
          onSubmit={(data) => handleFormSubmit(2, data)} 
          initialData={education}
        />;
      case 3:
        return <SkillsForm 
          onSubmit={(data) => handleFormSubmit(3, data)} 
          initialData={skills}
        />;
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Preview Your CV</h3>
            <div className="space-y-4">
              <section>
                <h4 className="font-medium mb-2">Personal Information</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(personalInfo, null, 2)}
                </pre>
              </section>
              <Separator />
              <section>
                <h4 className="font-medium mb-2">Work Experience</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(workExperience, null, 2)}
                </pre>
              </section>
              <Separator />
              <section>
                <h4 className="font-medium mb-2">Education</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(education, null, 2)}
                </pre>
              </section>
              <Separator />
              <section>
                <h4 className="font-medium mb-2">Skills</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
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
    <div className="container max-w-4xl mx-auto py-6 space-y-8">
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
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={`
                  rounded-full h-8 w-8 flex items-center justify-center
                  border-2 transition-colors duration-200
                  ${
                    index <= currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-background text-muted-foreground"
                  }
                `}
              >
                {index + 1}
              </div>
              <span
                className={`text-sm hidden sm:block ${
                  index <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-[2px] bg-muted -z-10">
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
        {currentStep > 0 && (  // Only show Previous button if not on first step
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          >
            Previous
          </Button>
        )}
        {currentStep === 0 && <div />} {/* Empty div to maintain spacing when button is hidden */}
        {currentStep === steps.length - 1 ? (
          <Button onClick={handleFinalSubmit}>Generate CV</Button>
        ) : null}
      </div>
    </div>
  );
}