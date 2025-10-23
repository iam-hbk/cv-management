import { z } from "zod";

/**
 * Executive Summary is NOT part of the form, but is used to generate the form
 * Please bro, don't add it to the form in whatever circumstances
 * Unless you have read this comment and understand the consequences
 */
export const executiveSummarySchema = z.object({
  executiveSummary: z.string().min(50, "Executive summary must be detailed"),
  jobTitle: z
    .string()
    .min(1, "Job title is required")
    .max(21, "Job title must be less than 21 characters"),
});

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  profession: z.string().min(1, "Profession is required"),
  location: z.string().min(1, "Location is required"),
  gender: z.enum(["male", "female", "other"], {
      error: (issue) => issue.input === undefined ? "Gender is required" : "Please select male, female or other"
}),
  availability: z.string().min(1, "Availability is required"),
  nationality: z.string().min(1, "Nationality is required"),
  currentSalary: z.number().min(0, "Salary must be positive"),
  expectedSalary: z.number().min(0, "Expected salary must be positive"),
  driversLicense: z.boolean().prefault(false),
  idNumber: z.string().min(1, "ID Number is required"),
});

export const workExperienceSchema = z.object({
  experiences: z.array(
    z.object({
      company: z.string().min(1, "Required"),
      position: z.string().min(1, "Required"),
      startDate: z.date(),
      endDate: z.date().optional(),
      current: z.boolean(),
      duties: z.array(z.string().min(1, "Required")),
      reasonForLeaving: z.string(),
    }),
  ),
});

export const educationSchema = z.object({
  educations: z.array(
    z.object({
      institution: z.string().min(1, "Required"),
      qualification: z.string().min(1, "Required"),
      completionDate: z.number(),
      completed: z.boolean(),
    }),
  ),
});

export const skillsSchema = z.object({
  computerSkills: z.array(z.string().min(1, "Required")),
  otherSkills: z.array(z.string().min(1, "Required")),
  skillsMatrix: z.array(
    z.object({
      skill: z.string(),
      yearsExperience: z.number(),
      proficiency: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
      lastUsed: z.number(),
    }),
  ),
});

export const cvSchema = z.object({
  executiveSummary: z.string().min(50, "Executive summary must be detailed"),
  personalInfo: personalInfoSchema,
  workHistory: workExperienceSchema,
  education: educationSchema,
  skills: skillsSchema,
});

export type CVFormData = z.infer<typeof cvSchema>;
export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;
export type WorkExperienceSchema = z.infer<typeof workExperienceSchema>;
export type EducationSchema = z.infer<typeof educationSchema>;
export type SkillsSchema = z.infer<typeof skillsSchema>;
export type ExecutiveSummarySchema = z.infer<typeof executiveSummarySchema>;
