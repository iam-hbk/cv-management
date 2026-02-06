import { v } from "convex/values";

/**
 * Lenient CV Form Validators for Convex
 *
 * These validators mirror the Zod schemas in schemas/cv.schema.ts
 * but use v.optional() to allow partial saves during draft creation.
 * This enables users to save incomplete CVs as drafts.
 */

// Availability options - must match AVAILABILITY_OPTIONS in schemas/cv.schema.ts
export const availabilityValidator = v.union(
	v.literal("Immediate"),
	v.literal("1 Week"),
	v.literal("2 Weeks"),
	v.literal("1 Month"),
	v.literal("2 Months"),
	v.literal("3 Months"),
	v.literal("Negotiable")
);

// Personal Information validator (lenient - all fields optional for drafts)
export const personalInfoValidator = v.object({
	firstName: v.optional(v.string()),
	lastName: v.optional(v.string()),
	email: v.optional(v.string()),
	phone: v.optional(v.string()),
	profession: v.optional(v.string()),
	location: v.optional(v.string()),
	gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
	availability: v.optional(availabilityValidator),
	nationality: v.optional(v.string()),
	currentSalary: v.optional(v.number()),
	expectedSalary: v.optional(v.number()),
	driversLicense: v.optional(v.boolean()),
	idNumber: v.optional(v.string()),
});

// Work Experience entry validator
export const workExperienceEntryValidator = v.object({
	company: v.optional(v.string()),
	position: v.optional(v.string()),
	startDate: v.optional(v.string()),
	endDate: v.optional(v.string()),
	current: v.optional(v.boolean()),
	duties: v.optional(v.array(v.string())),
	reasonForLeaving: v.optional(v.string()),
});

// Work History validator
export const workHistoryValidator = v.object({
	experiences: v.optional(v.array(workExperienceEntryValidator)),
});

// Education entry validator
export const educationEntryValidator = v.object({
	institution: v.optional(v.string()),
	qualification: v.optional(v.string()),
	completionDate: v.optional(v.number()),
	completed: v.optional(v.boolean()),
});

// Education validator
export const educationValidator = v.object({
	educations: v.optional(v.array(educationEntryValidator)),
});

// Skills matrix entry validator
export const skillsMatrixEntryValidator = v.object({
	skill: v.optional(v.string()),
	yearsExperience: v.optional(v.number()),
	proficiency: v.optional(
		v.union(
			v.literal("Beginner"),
			v.literal("Intermediate"),
			v.literal("Advanced"),
			v.literal("Expert")
		)
	),
	lastUsed: v.optional(v.number()),
});

// Skills validator
export const skillsValidator = v.object({
	computerSkills: v.optional(v.array(v.string())),
	otherSkills: v.optional(v.array(v.string())),
	skillsMatrix: v.optional(v.array(skillsMatrixEntryValidator)),
});

// Complete CV Form Data validator (lenient for drafts)
export const cvFormDataValidator = v.object({
	executiveSummary: v.optional(v.string()),
	personalInfo: v.optional(personalInfoValidator),
	workHistory: v.optional(workHistoryValidator),
	education: v.optional(educationValidator),
	skills: v.optional(skillsValidator),
});

// Type exports for use in TypeScript
export type PersonalInfo = typeof personalInfoValidator.type;
export type WorkExperienceEntry = typeof workExperienceEntryValidator.type;
export type WorkHistory = typeof workHistoryValidator.type;
export type EducationEntry = typeof educationEntryValidator.type;
export type Education = typeof educationValidator.type;
export type SkillsMatrixEntry = typeof skillsMatrixEntryValidator.type;
export type Skills = typeof skillsValidator.type;
export type CVFormData = typeof cvFormDataValidator.type;
