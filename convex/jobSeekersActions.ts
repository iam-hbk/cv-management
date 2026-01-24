"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { r2 } from "./r2";

// --- Email helpers ---

function jobSeekerAdminEmailHtml(props: {
	firstName: string;
	lastName: string;
	email: string;
	mobileNumber: string;
	currentSalaryRange: string;
	currentSalaryRate: string;
	nationality: string;
	downloadLink: string;
}): string {
	return `
<div>
	<h1 style="font-size: 18px;">A Job Seeker has submitted their CV</h1>
	<div style="padding: 10px;">
		<div>Full Name : ${props.firstName} ${props.lastName}</div>
		<div>Email : ${props.email}</div>
		<div>Mobile Number : ${props.mobileNumber}</div>
		<div>Current Salary Range : ${props.currentSalaryRange}</div>
		<div>Current Salary Rate : ${props.currentSalaryRate}</div>
		<div>Nationality : ${props.nationality}</div>
		<br />
		You can learn more about the job seeker by <a style="color: blue; text-decoration: underline;" href="${props.downloadLink}">downloading</a> their CV
	</div>
</div>
	`.trim();
}

async function sendJobSeekerConfirmationEmails(props: {
	firstName: string;
	lastName: string;
	email: string;
	mobileNumber: string;
	currentSalaryRange: string;
	currentSalaryRate: string;
	nationality: string;
	downloadLink: string;
}): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
	const resend = new Resend(apiKey);

	const toAdmin = await resend.emails.send({
		from: "Intobeing <info@intobeingplacements.co.za>",
		to: ["terry@intobeingplacements.co.za", "nexusthestaff@gmail.com"],
		subject: "New CV Uploaded on Intobeing Placements",
		html: jobSeekerAdminEmailHtml(props),
	});
	if (toAdmin.error) throw toAdmin.error;

	const firstName = props.firstName;
	const confirm = await resend.emails.send({
		from: "Intobeing <info@intobeingplacements.co.za>",
		to: [props.email],
		subject: "Into-Being Placements",
		text: `Hello ${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()},\n\nThank you for reaching out to us. We have received your CV and will get back to you as soon as possible.\n\nBest Regards,\nInto-Being Placements`,
	});
	if (confirm.error) throw confirm.error;
}

// --- CV Submission Action ---

export const submitCV = action({
	args: {
		idNumber: v.string(),
		firstName: v.string(),
		lastName: v.string(),
		mobileNumber: v.string(),
		email: v.string(),
		currentSalary: v.string(),
		currentSalaryRate: v.string(),
		nationality: v.string(),
		ethnicity: v.string(),
		fileBase64: v.string(),
		fileName: v.string(),
		contentType: v.string(),
	},
	handler: async (ctx, args) => {
		const fileKey = `CVs/${args.fileName}`;
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
			throw new Error("Failed to upload CV");
		}

		// Get the URL for the uploaded file
		const fileUrl = await r2.getUrl(key);

		// 2. Save to Convex database
		let inserted: Doc<"jobSeekers"> | null;
		try {
			inserted = await ctx.runMutation(api.jobSeekers.addJobSeeker, {
				idNumber: args.idNumber,
				firstName: args.firstName,
				lastName: args.lastName,
				mobileNumber: args.mobileNumber,
				email: args.email,
				currentSalaryRange: args.currentSalary,
				currentSalaryRate: args.currentSalaryRate,
				nationality: args.nationality,
				ethnicity: args.ethnicity,
				cvUploadPath: fileUrl,
			});
		} catch (e) {
			// Rollback: delete uploaded file
			await r2.deleteObject(ctx, key).catch(() => {});
			throw e;
		}

		if (!inserted) {
			await r2.deleteObject(ctx, key).catch(() => {});
			throw new Error("Failed to save job seeker information");
		}

		// 3. Send confirmation emails
		await sendJobSeekerConfirmationEmails({
			firstName: inserted.firstName,
			lastName: inserted.lastName,
			email: inserted.email,
			mobileNumber: inserted.mobileNumber,
			currentSalaryRange: inserted.currentSalaryRange,
			currentSalaryRate: inserted.currentSalaryRate,
			nationality: inserted.nationality,
			downloadLink: fileUrl,
		});

		return { message: "Your CV has been submitted successfully" };
	},
});
