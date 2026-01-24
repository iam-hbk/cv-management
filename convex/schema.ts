import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	jobSeekers: defineTable({
		nationality: v.string(),
		idNumber: v.string(),
		firstName: v.string(),
		lastName: v.string(),
		mobileNumber: v.string(),
		email: v.string(),
		ethnicity: v.string(),
		currentSalaryRate: v.string(),
		currentSalaryRange: v.string(),
		cvUploadPath: v.string(),
	}),

	vacancies: defineTable({
		postedBy: v.string(),
		companyName: v.string(),
		postedByEmail: v.string(),
		postedByMobile: v.string(),
		postedBySource: v.string(),
		jobNiche: v.string(),
		jobTitle: v.string(),
		jobDescription: v.string(),
		jobRegion: v.string(),
		workingModel: v.union(
			v.literal("hybrid"),
			v.literal("on-site"),
			v.literal("remote"),
		),
		vacancyFilePath: v.string(),
		status: v.union(
			v.literal("pending"),
			v.literal("approved"),
			v.literal("rejected"),
		),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_status", ["status"]),
});
