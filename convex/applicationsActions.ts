"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";

// --- Email helpers ---

function applicationStatusEmailHtml(props: {
	applicantName: string;
	jobTitle: string;
	companyName: string;
	status: string;
	message: string;
}): string {
	const statusColors: Record<string, string> = {
		reviewed: "#3b82f6",
		shortlisted: "#f59e0b",
		hired: "#22c55e",
		rejected: "#dc2626",
		pending: "#6b7280",
	};

	const statusColor = statusColors[props.status] || "#6b7280";
	const statusCapitalized = props.status.charAt(0).toUpperCase() + props.status.slice(1);

	return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
	<h1 style="font-size: 24px; color: #111827;">Application Status Update</h1>
	
	<p style="font-size: 16px; color: #374151;">Dear ${props.applicantName},</p>
	
	<p style="font-size: 16px; color: #374151;">
		We are writing to inform you about the status of your application for the position of 
		<strong>${props.jobTitle}</strong> at <strong>${props.companyName}</strong>.
	</p>
	
	<div style="background-color: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 16px; margin: 24px 0; border-radius: 4px;">
		<p style="margin: 0; font-size: 18px; font-weight: bold; color: ${statusColor};">
			Status: ${statusCapitalized}
		</p>
	</div>
	
	<p style="font-size: 16px; color: #374151;">${props.message}</p>
	
	<p style="font-size: 16px; color: #374151; margin-top: 24px;">
		If you have any questions, please feel free to contact us.
	</p>
	
	<p style="font-size: 16px; color: #374151;">
		Best Regards,<br />
		<strong>Into-Being Placements</strong>
	</p>
</div>
	`.trim();
}

function getStatusMessage(status: string): string {
	const messages: Record<string, string> = {
		reviewed:
			"Your application has been reviewed by our team. We are currently evaluating candidates and will be in touch with the next steps soon.",
		shortlisted:
			"Congratulations! Your application has been shortlisted. Our team will contact you shortly to schedule an interview.",
		hired:
			"Congratulations! We are pleased to inform you that you have been selected for this position. Our HR team will contact you with the next steps regarding your employment.",
		rejected:
			"Thank you for your interest in this position. After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our requirements. We wish you all the best in your job search.",
		pending:
			"Your application has been received and is pending review. We will update you once our team has had a chance to review your qualifications.",
	};

	return (
		messages[status] ||
		"Your application status has been updated. Please check your dashboard for more details."
	);
}

// --- Email Actions ---

export const sendApplicationStatusEmail = action({
	args: {
		applicationId: v.id("applications"),
		status: v.union(
			v.literal("pending"),
			v.literal("reviewed"),
			v.literal("shortlisted"),
			v.literal("rejected"),
			v.literal("hired")
		),
	},
	handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
		// Get application with details
		const applicationWithDetails = await ctx.runQuery(
			api.applications.getApplicationByIdWithDetails,
			{ id: args.applicationId }
		);

		if (!applicationWithDetails) {
			throw new Error("Application not found");
		}

		const { application, jobSeeker, vacancy } = applicationWithDetails;

		if (!jobSeeker || !vacancy) {
			throw new Error("Job seeker or vacancy not found");
		}

		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
		const resend = new Resend(apiKey);

		const applicantName = `${jobSeeker.firstName} ${jobSeeker.lastName}`;
		const statusCapitalized = args.status.charAt(0).toUpperCase() + args.status.slice(1);

		const result = await resend.emails.send({
			from: "Intobeing <info@intobeingplacements.co.za>",
			to: [jobSeeker.email],
			subject: `Application Status Update - ${statusCapitalized} | ${vacancy.jobTitle}`,
			html: applicationStatusEmailHtml({
				applicantName,
				jobTitle: vacancy.jobTitle,
				companyName: vacancy.companyName,
				status: args.status,
				message: getStatusMessage(args.status),
			}),
		});

		if (result.error) throw result.error;

		// Log email sent
		await ctx.runMutation(api.applications.addActivityLog, {
			entityType: "application",
			entityId: args.applicationId,
			action: "email_sent",
			performedBy: "system",
			details: `Status update email sent for status: ${args.status}`,
		});

		return {
			success: true,
			message: `Status email sent to ${jobSeeker.email}`,
		};
	},
});

export const sendBulkApplicationStatusEmails = action({
	args: {
		applicationIds: v.array(v.id("applications")),
		status: v.union(
			v.literal("reviewed"),
			v.literal("shortlisted"),
			v.literal("rejected"),
			v.literal("hired")
		),
	},
	handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
		const results = [];
		const errors = [];

		for (const applicationId of args.applicationIds) {
			try {
				const result = await ctx.runAction(api.applicationsActions.sendApplicationStatusEmail, {
					applicationId,
					status: args.status,
				});
				results.push(result);
			} catch (error) {
				errors.push({ applicationId, error: String(error) });
			}
		}

		return {
			success: errors.length === 0,
			message: `Sent ${results.length} emails successfully. ${errors.length} failed.`,
		};
	},
});

export const logActivity = action({
	args: {
		entityType: v.union(v.literal("application"), v.literal("vacancy"), v.literal("jobSeeker")),
		entityId: v.id("applications"),
		action: v.string(),
		performedBy: v.optional(v.string()),
		details: v.optional(v.string()),
	},
	handler: async (ctx, args): Promise<{ success: boolean }> => {
		try {
			await ctx.runMutation(api.applications.addActivityLog, {
				entityType: args.entityType,
				entityId: args.entityId,
				action: args.action,
				performedBy: args.performedBy,
				details: args.details,
			});
			return { success: true };
		} catch (error) {
			console.error("Failed to log activity:", error);
			return { success: false };
		}
	},
});
