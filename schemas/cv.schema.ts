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
	email: z.email(),
	phone: z.string().min(1, "Phone number is required"),
	profession: z.string().min(1, "Profession is required"),
	location: z.string().min(1, "Location is required"),
	gender: z.enum(["male", "female", "other"]),
	availability: z.preprocess(
		(val) => (val === "" || val === null || val === undefined ? undefined : val),
		z.string().default("Not specified")
	),
	nationality: z.string().min(1, "Nationality is required"),
	currentSalary: z.number().min(0, "Salary must be positive"),
	expectedSalary: z.number().min(0, "Expected salary must be positive"),
	driversLicense: z.boolean().default(false),
	idNumber: z.string().min(1, "ID Number is required"),
});

export const workExperienceSchema = z.object({
	experiences: z.array(
		z.object({
			company: z.string().min(1, "Required"),
			position: z.string().min(1, "Required"),
			startDate: z.string().default(""),
			endDate: z.string().optional().default(""),
			current: z.boolean(),
			duties: z.array(z.string().min(1, "Required")),
			reasonForLeaving: z.string().default(""),
		})
	),
});

export const educationSchema = z.object({
	educations: z.array(
		z.object({
			institution: z.string().min(1, "Required"),
			qualification: z.string().min(1, "Required"),
			completionDate: z.number(),
			completed: z.boolean(),
		})
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
		})
	),
});

export const cvSchema = z.object({
	executiveSummary: z.string().min(50, "Executive summary must be detailed"),
	personalInfo: personalInfoSchema,
	workHistory: workExperienceSchema,
	education: educationSchema,
	skills: skillsSchema,
});

export type Cv = z.infer<typeof cvSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skills = z.infer<typeof skillsSchema>;
export type ExecutiveSummary = z.infer<typeof executiveSummarySchema>;

// Schema types for forms
export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;
export type WorkExperienceSchema = z.infer<typeof workExperienceSchema>;
export type EducationSchema = z.infer<typeof educationSchema>;
export type SkillsSchema = z.infer<typeof skillsSchema>;
export type ExecutiveSummarySchema = z.infer<typeof executiveSummarySchema>;

// CV Form data type
export type CVFormData = Cv;

// Lenient schemas for AI extraction - allows missing/incomplete data
export const personalInfoSchemaLenient = z.object({
	firstName: z.string().default(""),
	lastName: z.string().default(""),
	email: z.string().default(""),
	phone: z.string().default(""),
	profession: z.string().default(""),
	location: z.string().default(""),
	gender: z.enum(["male", "female", "other"]).optional(),
	availability: z.preprocess(
		(val) => (val === "" || val === null || val === undefined ? undefined : val),
		z.string().default("Not specified")
	),
	nationality: z.string().default(""),
	currentSalary: z.number().default(0),
	expectedSalary: z.number().default(0),
	driversLicense: z.boolean().default(false),
	idNumber: z.string().default(""),
});

export const workExperienceSchemaLenient = z.object({
	experiences: z
		.array(
			z.object({
				company: z.string().default(""),
				position: z.string().default(""),
				startDate: z.string().default(""),
				endDate: z.string().default(""),
				current: z.boolean().default(false),
				duties: z.array(z.string()).default([]),
				reasonForLeaving: z.string().default(""),
			})
		)
		.default([]),
});

export const educationSchemaLenient = z.object({
	educations: z
		.array(
			z.object({
				institution: z.string().default(""),
				qualification: z.string().default(""),
				completionDate: z.number().optional(),
				completed: z.boolean().default(false),
			})
		)
		.default([]),
});

export const skillsSchemaLenient = z.object({
	computerSkills: z.array(z.string()).default([]),
	otherSkills: z.array(z.string()).default([]),
	skillsMatrix: z
		.array(
			z.object({
				skill: z.string().default(""),
				yearsExperience: z.number().optional(),
				proficiency: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
				lastUsed: z.number().optional(),
			})
		)
		.default([]),
});

export const cvSchemaLenient = z.object({
	executiveSummary: z.string().default(""),
	jobTitle: z.string().default(""),
	personalInfo: personalInfoSchemaLenient,
	workHistory: workExperienceSchemaLenient,
	education: educationSchemaLenient,
	skills: skillsSchemaLenient,
});
