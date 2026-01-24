import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- Queries ---

export const getAllJobSeekers = query({
	handler: async (ctx) => {
		return await ctx.db.query("jobSeekers").order("desc").collect();
	},
});

export const getJobSeekerById = query({
	args: { id: v.id("jobSeekers") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

// --- Mutations ---

export const addJobSeeker = mutation({
	args: {
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
	},
	handler: async (ctx, args) => {
		const jobSeekerId = await ctx.db.insert("jobSeekers", {
			nationality: args.nationality,
			idNumber: args.idNumber,
			firstName: args.firstName,
			lastName: args.lastName,
			mobileNumber: args.mobileNumber,
			email: args.email,
			ethnicity: args.ethnicity,
			currentSalaryRate: args.currentSalaryRate,
			currentSalaryRange: args.currentSalaryRange,
			cvUploadPath: args.cvUploadPath,
		});

		return await ctx.db.get(jobSeekerId);
	},
});

export const updateJobSeeker = mutation({
	args: {
		id: v.id("jobSeekers"),
		nationality: v.optional(v.string()),
		idNumber: v.optional(v.string()),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		mobileNumber: v.optional(v.string()),
		email: v.optional(v.string()),
		ethnicity: v.optional(v.string()),
		currentSalaryRate: v.optional(v.string()),
		currentSalaryRange: v.optional(v.string()),
		cvUploadPath: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		// Filter out undefined values
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined)
		);
		await ctx.db.patch(id, filteredUpdates);
		return await ctx.db.get(id);
	},
});

export const deleteJobSeeker = mutation({
	args: { id: v.id("jobSeekers") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return { success: true };
	},
});
