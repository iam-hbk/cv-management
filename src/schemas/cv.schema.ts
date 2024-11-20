import { z } from "zod";

export const personalInfoSchema = z.object({
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
  duties: z.array(z.string()).min(1, "At least one duty is required"),
  reasonForLeaving: z.string().optional(),
});
export const educationSchema = z.array(
  z.object({
    institution: z.string().min(1),
    qualification: z.string().min(1),
    completionDate: z.date(),
  })
);
export const cvSchema = z.object({
  executiveSummary: z.string().min(50, "Executive summary must be detailed"),
  personalInfo: personalInfoSchema,
  workHistory: z.array(workExperienceSchema),
  education: educationSchema,
  skills: z.array(z.string()).min(1),
});

export type CVFormData = z.infer<typeof cvSchema>;
export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;
export type WorkExperienceSchema = z.infer<typeof workExperienceSchema>;
export type EducationSchema = z.infer<typeof educationSchema>;
