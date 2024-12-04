import { z } from "zod";

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  profession: z.string().min(1, "Profession is required"),
  location: z.string().min(1, "Location is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
    invalid_type_error: "Please select male, female or other",
  }),
  availability: z.string().min(1, "Availability is required"),
  nationality: z.string().min(1, "Nationality is required"),
  currentSalary: z.number().min(0, "Salary must be positive"),
  expectedSalary: z.number().min(0, "Expected salary must be positive"),
  driversLicense: z.boolean().default(false),
  idNumber: z.string().min(1, "ID Number is required"),
});

export const workExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  startDate: z.date(),
  endDate: z.date().nullable(),
  current: z.boolean().default(false),
  duties: z.array(z.string()).min(1, "At least one duty is required"),
  reasonForLeaving: z.string().optional(),
});
export const educationSchema = z.object({
  institution: z.string().min(1),
  qualification: z.string().min(1),
  completionDate: z.number(),
  completed: z.boolean().default(false),
});

export const skillsSchema = z.object({
  computerSkills: z.array(z.string()),
  otherSkills: z.array(z.string()),
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
  workHistory: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  skills: skillsSchema,
});

export type CVFormData = z.infer<typeof cvSchema>;
export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;
export type WorkExperienceSchema = z.infer<typeof workExperienceSchema>;
export type EducationSchema = z.infer<typeof educationSchema>;
export type SkillsSchema = z.infer<typeof skillsSchema>;
