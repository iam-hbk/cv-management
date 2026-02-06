"use node";

import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { r2 } from "./r2";

// Helper to extract R2 key from a signed URL
function extractR2KeyFromSignedUrl(signedUrl: string): string | null {
	try {
		const url = new URL(signedUrl);
		// The path starts with / so we remove it
		// e.g., /CVs/James-Bond.pdf -> CVs/James-Bond.pdf
		const path = decodeURIComponent(url.pathname);
		return path.startsWith("/") ? path.slice(1) : path;
	} catch {
		return null;
	}
}

// --- Get Fresh CV URL Action ---

export const getFreshCvUrl = action({
	args: {
		jobSeekerId: v.id("jobSeekers"),
	},
	handler: async (
		ctx,
		args
	): Promise<{
		url: string;
		jobSeeker: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
			mobileNumber: string;
		};
	}> => {
		// 1. Get the job seeker
		const jobSeeker: Doc<"jobSeekers"> | null = await ctx.runQuery(
			api.jobSeekers.getJobSeekerById,
			{
				id: args.jobSeekerId,
			}
		);

		if (!jobSeeker) {
			throw new Error("Job seeker not found");
		}

		if (!jobSeeker.cvUploadPath) {
			throw new Error("Job seeker has no CV uploaded");
		}

		// 2. Extract the R2 key from the stored signed URL
		const key = extractR2KeyFromSignedUrl(jobSeeker.cvUploadPath);
		if (!key) {
			throw new Error("Invalid CV path format");
		}

		// 3. Generate a fresh signed URL (valid for 1 hour)
		const freshUrl = await r2.getUrl(key, { expiresIn: 3600 });

		return {
			url: freshUrl,
			jobSeeker: {
				id: jobSeeker._id,
				firstName: jobSeeker.firstName,
				lastName: jobSeeker.lastName,
				email: jobSeeker.email,
				mobileNumber: jobSeeker.mobileNumber,
			},
		};
	},
});

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
	vacancy?: {
		jobTitle: string;
		companyName: string;
	};
}): string {
	const vacancyInfo = props.vacancy
		? `
		<div style="background-color: #f0f0f0; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff;">
			<strong>Applied for Position:</strong><br/>
			Job Title: ${props.vacancy.jobTitle}<br/>
			Company: ${props.vacancy.companyName}
		</div>
		`
		: "";

	return `
<div>
	<h1 style="font-size: 18px;">A Job Seeker has submitted their CV</h1>
	${vacancyInfo}
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
	vacancy?: {
		jobTitle: string;
		companyName: string;
	};
}): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
	const resend = new Resend(apiKey);

	const subject = props.vacancy
		? `New Application for ${props.vacancy.jobTitle} at ${props.vacancy.companyName}`
		: "New CV Uploaded on Intobeing Placements";

	const toAdmin = await resend.emails.send({
		from: "Intobeing <info@intobeingplacements.co.za>",
		to: ["terry@intobeingplacements.co.za", "nexusthestaff@gmail.com"],
		subject,
		html: jobSeekerAdminEmailHtml(props),
	});
	if (toAdmin.error) throw toAdmin.error;

	const firstName = props.firstName;
	const vacancyText = props.vacancy ? ` for the position of ${props.vacancy.jobTitle}` : "";
	const confirm = await resend.emails.send({
		from: "Intobeing <info@intobeingplacements.co.za>",
		to: [props.email],
		subject: "Into-Being Placements - Application Received",
		text: `Hello ${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()},\n\nThank you for applying${vacancyText}. We have received your CV and will get back to you as soon as possible.\n\nBest Regards,\nIntobeing Placements`,
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
		vacancyId: v.optional(v.id("vacancies")),
	},
	handler: async (ctx, args) => {
		const fileKey = `CVs/${args.fileName}`;
		const buffer = Buffer.from(args.fileBase64, "base64");

		// Fetch vacancy details if vacancyId is provided
		let vacancy: Doc<"vacancies"> | null = null;
		if (args.vacancyId) {
			vacancy = await ctx.runQuery(api.vacancies.getVacancyById, {
				id: args.vacancyId,
			});
			if (!vacancy) {
				throw new Error("Vacancy not found");
			}
		}

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

		// 3. Create application record if vacancyId is provided
		if (args.vacancyId && vacancy) {
			try {
				await ctx.runMutation(api.applications.addApplication, {
					vacancyId: args.vacancyId,
					jobSeekerId: inserted._id,
					status: "pending",
				});
			} catch (e) {
				console.error("Failed to create application record:", e);
				// Don't throw here - the CV was still submitted successfully
			}
		}

		// 4. Send confirmation emails
		await sendJobSeekerConfirmationEmails({
			firstName: inserted.firstName,
			lastName: inserted.lastName,
			email: inserted.email,
			mobileNumber: inserted.mobileNumber,
			currentSalaryRange: inserted.currentSalaryRange,
			currentSalaryRate: inserted.currentSalaryRate,
			nationality: inserted.nationality,
			downloadLink: fileUrl,
			vacancy: vacancy
				? {
						jobTitle: vacancy.jobTitle,
						companyName: vacancy.companyName,
					}
				: undefined,
		});

		return {
			message: args.vacancyId
				? "Your application has been submitted successfully"
				: "Your CV has been submitted successfully",
		};
	},
});
