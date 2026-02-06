import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { type CVFormData, cvFormDataValidator } from "./validators";

// Get all CVs for the current user
export const getCVs = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}

		const cvs = await ctx.db
			.query("cvs")
			.withIndex("by_user", (q) => q.eq("userId", user._id.toString()))
			.order("desc")
			.collect();

		return cvs.map((cv) => ({
			id: cv._id,
			jobTitle: cv.jobTitle,
			sourceJobSeekerId: cv.sourceJobSeekerId ?? null,
			createdAt: cv.createdAt,
			createdBy: {
				name: cv.creatorName ?? "Unknown",
				email: cv.creatorEmail ?? "unknown@example.com",
			},
			lastUpdatedBy: cv.updatedByName
				? {
						name: cv.updatedByName,
						email: cv.updatedByEmail ?? "unknown@example.com",
					}
				: null,
			isAiAssisted: cv.isAiAssisted,
			status: cv.status,
			formData: cv.formData,
		}));
	},
});

// Get a single CV by ID
export const getCVById = query({
	args: { id: v.id("cvs") },
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}

		const cv = await ctx.db.get(args.id);
		if (!cv) {
			return null;
		}

		// Check ownership
		if (cv.userId !== user._id.toString()) {
			throw new Error("Unauthorized");
		}

		return {
			id: cv._id,
			jobTitle: cv.jobTitle,
			createdAt: cv.createdAt,
			createdBy: {
				name: cv.creatorName ?? "Unknown",
				email: cv.creatorEmail ?? "unknown@example.com",
			},
			lastUpdatedBy: cv.updatedByName
				? {
						name: cv.updatedByName,
						email: cv.updatedByEmail ?? "unknown@example.com",
					}
				: null,
			isAiAssisted: cv.isAiAssisted,
			status: cv.status,
			formData: cv.formData,
		};
	},
});

// Create a new CV draft
export const createDraft = mutation({
	args: {
		jobTitle: v.string(),
		formData: cvFormDataValidator,
		sourceJobSeekerId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}

		const now = Date.now();

		const cvId = await ctx.db.insert("cvs", {
			userId: user._id.toString(),
			creatorName: user.name ?? user.email ?? "Unknown",
			creatorEmail: user.email ?? undefined,
			status: "draft",
			formData: args.formData,
			isAiAssisted: false,
			jobTitle: args.jobTitle,
			sourceJobSeekerId: args.sourceJobSeekerId,
			createdAt: now,
			updatedAt: now,
			updatedBy: user._id.toString(),
			updatedByName: user.name ?? user.email ?? "Unknown",
			updatedByEmail: user.email ?? undefined,
		});

		return cvId;
	},
});

// Type for partial CV updates
type CVUpdateFields = {
	jobTitle?: string;
	formData?: CVFormData;
	isAiAssisted?: boolean;
	sourceJobSeekerId?: string;
	updatedAt: number;
	updatedBy: string;
	updatedByName: string;
	updatedByEmail?: string;
};

// Update a CV draft
export const updateDraft = mutation({
	args: {
		id: v.id("cvs"),
		jobTitle: v.optional(v.string()),
		formData: v.optional(cvFormDataValidator),
		isAiAssisted: v.optional(v.boolean()),
		sourceJobSeekerId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}

		const cv = await ctx.db.get(args.id);
		if (!cv) {
			throw new Error("CV not found");
		}

		// Check ownership
		if (cv.userId !== user._id.toString()) {
			throw new Error("Unauthorized");
		}

		const updates: CVUpdateFields = {
			updatedAt: Date.now(),
			updatedBy: user._id.toString(),
			updatedByName: user.name ?? user.email ?? "Unknown",
			updatedByEmail: user.email ?? undefined,
		};

		if (args.jobTitle !== undefined) updates.jobTitle = args.jobTitle;
		if (args.formData !== undefined) updates.formData = args.formData;
		if (args.isAiAssisted !== undefined) updates.isAiAssisted = args.isAiAssisted;
		if (args.sourceJobSeekerId !== undefined) updates.sourceJobSeekerId = args.sourceJobSeekerId;

		await ctx.db.patch(args.id, updates);

		return args.id;
	},
});

// Submit (complete) a CV
export const submitCV = mutation({
	args: {
		id: v.id("cvs"),
		formData: cvFormDataValidator,
		isAiAssisted: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}

		const cv = await ctx.db.get(args.id);
		if (!cv) {
			throw new Error("CV not found");
		}

		// Check ownership
		if (cv.userId !== user._id.toString()) {
			throw new Error("Unauthorized");
		}

		const now = Date.now();

		await ctx.db.patch(args.id, {
			status: "completed",
			formData: args.formData,
			isAiAssisted: args.isAiAssisted ?? cv.isAiAssisted,
			updatedAt: now,
			updatedBy: user._id.toString(),
			updatedByName: user.name ?? user.email ?? "Unknown",
			updatedByEmail: user.email ?? undefined,
		});

		return args.id;
	},
});

// Create and immediately submit a CV
export const createAndSubmit = mutation({
	args: {
		jobTitle: v.string(),
		formData: cvFormDataValidator,
		isAiAssisted: v.boolean(),
		sourceJobSeekerId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}

		const now = Date.now();

		const cvId = await ctx.db.insert("cvs", {
			userId: user._id.toString(),
			creatorName: user.name ?? user.email ?? "Unknown",
			creatorEmail: user.email ?? undefined,
			status: "completed",
			formData: args.formData,
			isAiAssisted: args.isAiAssisted,
			jobTitle: args.jobTitle,
			sourceJobSeekerId: args.sourceJobSeekerId,
			createdAt: now,
			updatedAt: now,
			updatedBy: user._id.toString(),
			updatedByName: user.name ?? user.email ?? "Unknown",
			updatedByEmail: user.email ?? undefined,
		});

		return cvId;
	},
});

// Delete a CV
export const deleteCV = mutation({
	args: { id: v.id("cvs") },
	handler: async (ctx, args) => {
		const user = await authComponent.getAuthUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}

		const cv = await ctx.db.get(args.id);
		if (!cv) {
			throw new Error("CV not found");
		}

		// Check ownership
		if (cv.userId !== user._id.toString()) {
			throw new Error("Unauthorized");
		}

		await ctx.db.delete(args.id);

		return { success: true };
	},
});
