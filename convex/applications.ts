import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

// --- Queries ---

export const getAllApplications = query({
	handler: async (ctx) => {
		return await ctx.db.query("applications").order("desc").collect();
	},
});

export const getApplicationById = query({
	args: { id: v.id("applications") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getApplicationByIdWithDetails = query({
	args: { id: v.id("applications") },
	handler: async (ctx, args) => {
		const application = await ctx.db.get(args.id);
		if (!application) return null;

		const [jobSeeker, vacancy, activityLogs] = await Promise.all([
			ctx.db.get(application.jobSeekerId),
			ctx.db.get(application.vacancyId),
			ctx.db
				.query("activityLogs")
				.withIndex("by_entity", (q) => q.eq("entityType", "application").eq("entityId", args.id))
				.order("desc")
				.collect(),
		]);

		return {
			application,
			jobSeeker,
			vacancy,
			activityLogs,
		};
	},
});

export const getApplicationsWithDetails = query({
	handler: async (ctx) => {
		const applications = await ctx.db.query("applications").order("desc").collect();

		const applicationsWithDetails = await Promise.all(
			applications.map(async (app) => {
				const [jobSeeker, vacancy] = await Promise.all([
					ctx.db.get(app.jobSeekerId),
					ctx.db.get(app.vacancyId),
				]);
				return {
					...app,
					jobSeeker,
					vacancy,
				};
			})
		);

		return applicationsWithDetails;
	},
});

export const getApplicationsByVacancy = query({
	args: { vacancyId: v.id("vacancies") },
	handler: async (ctx, args) => {
		const applications = await ctx.db
			.query("applications")
			.withIndex("by_vacancy", (q) => q.eq("vacancyId", args.vacancyId))
			.order("desc")
			.collect();

		const applicationsWithDetails = await Promise.all(
			applications.map(async (app) => {
				const jobSeeker = await ctx.db.get(app.jobSeekerId);
				return {
					...app,
					jobSeeker,
				};
			})
		);

		return applicationsWithDetails;
	},
});

export const getApplicationsByJobSeeker = query({
	args: { jobSeekerId: v.id("jobSeekers") },
	handler: async (ctx, args) => {
		const applications = await ctx.db
			.query("applications")
			.withIndex("by_jobSeeker", (q) => q.eq("jobSeekerId", args.jobSeekerId))
			.order("desc")
			.collect();

		const applicationsWithDetails = await Promise.all(
			applications.map(async (app) => {
				const vacancy = await ctx.db.get(app.vacancyId);
				return {
					...app,
					vacancy,
				};
			})
		);

		return applicationsWithDetails;
	},
});

export const getApplicationsByStatus = query({
	args: {
		status: v.union(
			v.literal("pending"),
			v.literal("reviewed"),
			v.literal("shortlisted"),
			v.literal("rejected"),
			v.literal("hired")
		),
	},
	handler: async (ctx, args) => {
		const applications = await ctx.db
			.query("applications")
			.withIndex("by_status", (q) => q.eq("status", args.status))
			.order("desc")
			.collect();

		const applicationsWithDetails = await Promise.all(
			applications.map(async (app) => {
				const [jobSeeker, vacancy] = await Promise.all([
					ctx.db.get(app.jobSeekerId),
					ctx.db.get(app.vacancyId),
				]);
				return {
					...app,
					jobSeeker,
					vacancy,
				};
			})
		);

		return applicationsWithDetails;
	},
});

// --- Mutations ---

export const addApplication = mutation({
	args: {
		vacancyId: v.id("vacancies"),
		jobSeekerId: v.id("jobSeekers"),
		status: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("reviewed"),
				v.literal("shortlisted"),
				v.literal("rejected"),
				v.literal("hired")
			)
		),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const applicationId = await ctx.db.insert("applications", {
			vacancyId: args.vacancyId,
			jobSeekerId: args.jobSeekerId,
			status: args.status || "pending",
			createdAt: now,
			updatedAt: now,
		});

		// Log the creation
		await ctx.db.insert("activityLogs", {
			entityType: "application",
			entityId: applicationId,
			action: "created",
			performedBy: "system",
			details: `Application created with status: ${args.status || "pending"}`,
			createdAt: now,
		});

		return await ctx.db.get(applicationId);
	},
});

export const updateApplicationStatus = mutation({
	args: {
		id: v.id("applications"),
		status: v.union(
			v.literal("pending"),
			v.literal("reviewed"),
			v.literal("shortlisted"),
			v.literal("rejected"),
			v.literal("hired")
		),
		performedBy: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const application = await ctx.db.get(args.id);
		if (!application) {
			throw new Error("Application not found");
		}

		const previousStatus = application.status;
		const now = Date.now();

		await ctx.db.patch(args.id, {
			status: args.status,
			updatedAt: now,
		});

		// Log the status change
		await ctx.db.insert("activityLogs", {
			entityType: "application",
			entityId: args.id,
			action: "status_changed",
			performedBy: args.performedBy || "admin",
			details: `Status changed from "${previousStatus}" to "${args.status}"`,
			createdAt: now,
		});

		return await ctx.db.get(args.id);
	},
});

export const bulkUpdateApplicationStatus = mutation({
	args: {
		ids: v.array(v.id("applications")),
		status: v.union(
			v.literal("pending"),
			v.literal("reviewed"),
			v.literal("shortlisted"),
			v.literal("rejected"),
			v.literal("hired")
		),
		performedBy: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const results = [];

		for (const id of args.ids) {
			const application = await ctx.db.get(id);
			if (!application) continue;

			const previousStatus = application.status;

			await ctx.db.patch(id, {
				status: args.status,
				updatedAt: now,
			});

			// Log the status change
			await ctx.db.insert("activityLogs", {
				entityType: "application",
				entityId: id,
				action: "status_changed",
				performedBy: args.performedBy || "admin",
				details: `Status changed from "${previousStatus}" to "${args.status}" (bulk update)`,
				createdAt: now,
			});

			const updated = await ctx.db.get(id);
			if (updated) results.push(updated);
		}

		return { success: true, updatedCount: results.length };
	},
});

export const deleteApplication = mutation({
	args: { id: v.id("applications"), performedBy: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const application = await ctx.db.get(args.id);
		if (!application) {
			throw new Error("Application not found");
		}

		// Log the deletion
		await ctx.db.insert("activityLogs", {
			entityType: "application",
			entityId: args.id,
			action: "deleted",
			performedBy: args.performedBy || "admin",
			details: `Application deleted (Job Seeker: ${application.jobSeekerId}, Vacancy: ${application.vacancyId})`,
			createdAt: Date.now(),
		});

		await ctx.db.delete(args.id);
		return { success: true };
	},
});

// --- Activity Logs ---

export const getActivityLogsByEntity = query({
	args: {
		entityType: v.union(v.literal("application"), v.literal("vacancy"), v.literal("jobSeeker")),
		entityId: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("activityLogs")
			.withIndex("by_entity", (q) =>
				q.eq("entityType", args.entityType).eq("entityId", args.entityId)
			)
			.order("desc")
			.collect();
	},
});

export const addActivityLog = mutation({
	args: {
		entityType: v.union(v.literal("application"), v.literal("vacancy"), v.literal("jobSeeker")),
		entityId: v.string(),
		action: v.string(),
		performedBy: v.optional(v.string()),
		details: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const logId = await ctx.db.insert("activityLogs", {
			entityType: args.entityType,
			entityId: args.entityId,
			action: args.action,
			performedBy: args.performedBy || "system",
			details: args.details,
			createdAt: Date.now(),
		});
		return await ctx.db.get(logId);
	},
});
