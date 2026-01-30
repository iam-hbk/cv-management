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
		workingModel: v.union(v.literal("hybrid"), v.literal("on-site"), v.literal("remote")),
		vacancyFilePath: v.string(),
		status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_status", ["status"]),

	applications: defineTable({
		vacancyId: v.id("vacancies"),
		jobSeekerId: v.id("jobSeekers"),
		status: v.union(
			v.literal("pending"),
			v.literal("reviewed"),
			v.literal("shortlisted"),
			v.literal("rejected"),
			v.literal("hired")
		),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_vacancy", ["vacancyId"])
		.index("by_jobSeeker", ["jobSeekerId"])
		.index("by_status", ["status"]),

	activityLogs: defineTable({
		entityType: v.union(v.literal("application"), v.literal("vacancy"), v.literal("jobSeeker")),
		entityId: v.string(),
		action: v.string(),
		performedBy: v.optional(v.string()),
		details: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("by_entity", ["entityType", "entityId"])
		.index("by_createdAt", ["createdAt"]),
});
