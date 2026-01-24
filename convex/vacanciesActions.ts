"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { r2 } from "./r2";

// --- Email helpers ---

function vacancyAdminEmailHtml(props: {
	postedBy: string;
	companyName: string;
	postedByEmail: string;
	postedByMobile: string;
	postedBySource: string;
	jobNiche: string;
	jobTitle: string;
	jobDescription: string;
	jobRegion: string;
	workingModel: string;
	downloadLink: string;
}): string {
	return `
<div>
	<h1 style="font-size: 18px;">A Job Poster has submitted a Vacancy</h1>
	<div style="padding: 10px;">
		<div>Posted By : ${props.postedBy}</div>
		<div>Company Name : ${props.companyName}</div>
		<div>Email : ${props.postedByEmail}</div>
		<div>Mobile Number : ${props.postedByMobile}</div>
		<div>Posted By Source : ${props.postedBySource}</div>
		<div>Job Niche : ${props.jobNiche}</div>
		<div>Job Title : ${props.jobTitle}</div>
		<div>Job Description : ${props.jobDescription}</div>
		<div>Job Region : ${props.jobRegion}</div>
		<div>Working Model : ${props.workingModel}</div>
		<br />
		You can learn more about the job by <a style="color: blue; text-decoration: underline;" href="${props.downloadLink}">downloading</a> the vacancy details
	</div>
</div>
	`.trim();
}

function vacancyConfirmationHtml(firstName: string): string {
	const n =
		firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
	return `
<div>
	<h1>Hello ${n},</h1>
	<p>Thank you for reaching out to us.<br />Your job post has been uploaded successfully and is being reviewed.<br />You will be notified once the process is done.</p>
	<p>Best Regards,<br />Into-Being Placements</p>
</div>
	`.trim();
}

function vacancyApprovedHtml(props: {
	firstName: string;
	jobTitle: string;
	companyName: string;
}): string {
	const n =
		props.firstName.charAt(0).toUpperCase() +
		props.firstName.slice(1).toLowerCase();
	return `
<div>
	<h1>Hello ${n},</h1>
	<p>Great news! Your vacancy posting has been <strong style="color: green;">approved</strong>.</p>
	<div style="padding: 15px; background-color: #f0f9f0; border-radius: 8px; margin: 15px 0;">
		<p style="margin: 0;"><strong>Job Title:</strong> ${props.jobTitle}</p>
		<p style="margin: 5px 0 0 0;"><strong>Company:</strong> ${props.companyName}</p>
	</div>
	<p>Your vacancy is now live and visible to job seekers on our platform.</p>
	<p>Best Regards,<br />Into-Being Placements</p>
</div>
	`.trim();
}

function vacancyRejectedHtml(props: {
	firstName: string;
	jobTitle: string;
	companyName: string;
}): string {
	const n =
		props.firstName.charAt(0).toUpperCase() +
		props.firstName.slice(1).toLowerCase();
	return `
<div>
	<h1>Hello ${n},</h1>
	<p>We regret to inform you that your vacancy posting has been <strong style="color: #dc2626;">rejected</strong>.</p>
	<div style="padding: 15px; background-color: #fef2f2; border-radius: 8px; margin: 15px 0;">
		<p style="margin: 0;"><strong>Job Title:</strong> ${props.jobTitle}</p>
		<p style="margin: 5px 0 0 0;"><strong>Company:</strong> ${props.companyName}</p>
	</div>
	<p>If you have any questions or would like to discuss this decision, please feel free to contact us.</p>
	<p>Best Regards,<br />Into-Being Placements</p>
</div>
	`.trim();
}

async function sendVacancyConfirmationEmails(props: {
	postedBy: string;
	companyName: string;
	postedByEmail: string;
	postedByMobile: string;
	postedBySource: string;
	jobNiche: string;
	jobTitle: string;
	jobDescription: string;
	jobRegion: string;
	workingModel: string;
	downloadLink: string;
}): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
	const resend = new Resend(apiKey);

	const toAdmin = await resend.emails.send({
		from: "Intobeing <info@intobeingplacements.co.za>",
		to: ["terry@intobeingplacements.co.za", "nexusthestaff@gmail.com"],
		subject: "New Vacancy Uploaded on Intobeing Placements",
		html: vacancyAdminEmailHtml(props),
	});
	if (toAdmin.error) throw toAdmin.error;

	const confirm = await resend.emails.send({
		from: "Intobeing <info@intobeingplacements.co.za>",
		to: [props.postedByEmail],
		subject: "Into-Being Placements",
		html: vacancyConfirmationHtml(props.postedBy),
	});
	if (confirm.error) throw confirm.error;
}

// --- Vacancy Submission Action ---

export const submitVacancy = action({
	args: {
		nameAndSurname: v.string(),
		companyName: v.string(),
		email: v.string(),
		contactNumber: v.string(),
		heardAboutUs: v.string(),
		otherHeardAboutUs: v.optional(v.string()),
		niche: v.string(),
		jobTitle: v.string(),
		vacancyDetails: v.string(),
		region: v.string(),
		otherRegion: v.optional(v.string()),
		workModel: v.union(
			v.literal("hybrid"),
			v.literal("on-site"),
			v.literal("remote"),
		),
		fileBase64: v.string(),
		fileName: v.string(),
		contentType: v.string(),
	},
	handler: async (ctx, args) => {
		const fileKey = `vacancies/${args.fileName}`;
		const buffer = Buffer.from(args.fileBase64, "base64");

		// 1. Upload file to R2 using @convex-dev/r2
		let key: string;
		try {
			key = await r2.store(ctx, buffer, {
				key: fileKey,
				type: args.contentType,
			});
		} catch (e) {
			console.error(e);
			throw new Error("Failed to upload vacancy file");
		}

		// Get the URL for the uploaded file
		const fileUrl = await r2.getUrl(key);

		// Handle "other" options
		const heardAboutUs =
			args.heardAboutUs === "other"
				? args.otherHeardAboutUs || args.heardAboutUs
				: args.heardAboutUs;
		const region =
			args.region === "other" ? args.otherRegion || args.region : args.region;

		// 2. Save to Convex database
		let inserted: Doc<"vacancies"> | null;
		try {
			inserted = await ctx.runMutation(api.vacancies.addVacancy, {
				postedBy: args.nameAndSurname,
				companyName: args.companyName,
				postedByEmail: args.email,
				postedByMobile: args.contactNumber,
				postedBySource: heardAboutUs,
				jobNiche: args.niche,
				jobTitle: args.jobTitle,
				jobDescription: args.vacancyDetails,
				jobRegion: region,
				workingModel: args.workModel,
				vacancyFilePath: fileUrl,
			});
		} catch (e) {
			// Rollback: delete uploaded file
			await r2.deleteObject(ctx, key).catch(() => {});
			throw e;
		}

		if (!inserted) {
			await r2.deleteObject(ctx, key).catch(() => {});
			throw new Error("Failed to save vacancy information");
		}

		// 3. Send confirmation emails
		await sendVacancyConfirmationEmails({
			postedBy: inserted.postedBy,
			companyName: inserted.companyName,
			postedByEmail: inserted.postedByEmail,
			postedByMobile: inserted.postedByMobile,
			postedBySource: inserted.postedBySource,
			jobNiche: inserted.jobNiche,
			jobTitle: inserted.jobTitle,
			jobDescription: inserted.jobDescription,
			jobRegion: inserted.jobRegion,
			workingModel: inserted.workingModel,
			downloadLink: fileUrl,
		});

		return { message: "Your vacancy has been submitted successfully" };
	},
});

// --- Admin: Add Vacancy (upload file + insert with status approved, no emails) ---

export const submitVacancyFromAdmin = action({
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
		workingModel: v.union(
			v.literal("hybrid"),
			v.literal("on-site"),
			v.literal("remote"),
		),
		fileBase64: v.string(),
		fileName: v.string(),
		contentType: v.string(),
	},
	handler: async (ctx, args): Promise<Doc<"vacancies"> | null> => {
		const fileKey = `vacancies/${args.fileName}`;
		const buffer = Buffer.from(args.fileBase64, "base64");

		let key: string;
		try {
			key = await r2.store(ctx, buffer, {
				key: fileKey,
				type: args.contentType,
			});
		} catch (e) {
			console.error(e);
			throw new Error("Failed to upload vacancy file");
		}

		const fileUrl = await r2.getUrl(key);

		try {
			const inserted = await ctx.runMutation(api.vacancies.addVacancy, {
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
				vacancyFilePath: fileUrl,
				status: "approved",
			});
			return inserted;
		} catch (e) {
			await r2.deleteObject(ctx, key).catch(() => {});
			throw e;
		}
	},
});

// --- Vacancy Status Email Action ---

export const sendVacancyStatusEmail = action({
	args: {
		vacancyId: v.id("vacancies"),
		status: v.union(v.literal("approved"), v.literal("rejected")),
	},
	handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
		// Get the vacancy from the database
		const vacancy: Doc<"vacancies"> | null = await ctx.runQuery(api.vacancies.getVacancyById, {
			id: args.vacancyId,
		});

		if (!vacancy) {
			throw new Error("Vacancy not found");
		}

		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
		const resend = new Resend(apiKey);

		const emailHtml =
			args.status === "approved"
				? vacancyApprovedHtml({
						firstName: vacancy.postedBy,
						jobTitle: vacancy.jobTitle,
						companyName: vacancy.companyName,
					})
				: vacancyRejectedHtml({
						firstName: vacancy.postedBy,
						jobTitle: vacancy.jobTitle,
						companyName: vacancy.companyName,
					});

		const subject =
			args.status === "approved"
				? "Your Vacancy Has Been Approved - Into-Being Placements"
				: "Vacancy Status Update - Into-Being Placements";

		const result = await resend.emails.send({
			from: "Intobeing <info@intobeingplacements.co.za>",
			to: [vacancy.postedByEmail],
			subject,
			html: emailHtml,
		});

		if (result.error) throw result.error;

		return { success: true, message: `Status email sent to ${vacancy.postedByEmail}` };
	},
});
