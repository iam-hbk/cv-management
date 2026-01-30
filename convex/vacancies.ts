import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- Queries ---

export const getAllVacancies = query({
	handler: async (ctx) => {
		return await ctx.db.query("vacancies").order("desc").collect();
	},
});

export const getApprovedVacancies = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("vacancies")
			.withIndex("by_status", (q) => q.eq("status", "approved"))
			.order("desc")
			.collect();
	},
});

export const getVacancyById = query({
	args: { id: v.id("vacancies") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getVacanciesByStatus = query({
	args: {
		status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("vacancies")
			.withIndex("by_status", (q) => q.eq("status", args.status))
			.order("desc")
			.collect();
	},
});

export const getPendingVacancies = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("vacancies")
			.withIndex("by_status", (q) => q.eq("status", "pending"))
			.order("desc")
			.collect();
	},
});

// --- Mutations ---

export const addVacancy = mutation({
	args: {
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
		status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const status = args.status ?? "pending";
		const vacancyId = await ctx.db.insert("vacancies", {
			postedBy: args.postedBy,
			companyName: args.companyName,
			postedByEmail: args.postedByEmail,
			postedByMobile: args.postedByMobile,
			postedBySource: args.postedBySource,
			jobNiche: args.jobNiche,
			jobTitle: args.jobTitle,
			jobDescription: args.jobDescription,
			jobRegion: args.jobRegion,
			workingModel: args.workingModel,
			vacancyFilePath: args.vacancyFilePath,
			status,
			createdAt: now,
			updatedAt: now,
		});

		return await ctx.db.get(vacancyId);
	},
});

export const updateVacancyStatus = mutation({
	args: {
		id: v.id("vacancies"),
		status: v.union(v.literal("approved"), v.literal("rejected")),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			status: args.status,
			updatedAt: Date.now(),
		});
		return await ctx.db.get(args.id);
	},
});

export const updateVacancy = mutation({
	args: {
		id: v.id("vacancies"),
		postedBy: v.optional(v.string()),
		companyName: v.optional(v.string()),
		postedByEmail: v.optional(v.string()),
		postedByMobile: v.optional(v.string()),
		postedBySource: v.optional(v.string()),
		jobNiche: v.optional(v.string()),
		jobTitle: v.optional(v.string()),
		jobDescription: v.optional(v.string()),
		jobRegion: v.optional(v.string()),
		workingModel: v.optional(
			v.union(v.literal("hybrid"), v.literal("on-site"), v.literal("remote"))
		),
		vacancyFilePath: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		// Filter out undefined values and add updatedAt
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([, value]) => value !== undefined)
		);
		await ctx.db.patch(id, {
			...filteredUpdates,
			updatedAt: Date.now(),
		});
		return await ctx.db.get(id);
	},
});

export const deleteVacancy = mutation({
	args: { id: v.id("vacancies") },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return { success: true };
	},
});
