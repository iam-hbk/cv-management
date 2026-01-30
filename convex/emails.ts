"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

function contactUsAdminEmailHtml(name: string, email: string, message: string): string {
	return `
<div style="display: flex; flex-direction: column; width: 100%; align-items: center; gap: 3;">
	<h1 style="font-size: 18px;">A Visitor of the Into-Being Website sent an Email</h1>
	<div style="padding: 10px;">
		<div>Name : ${name}</div>
		<div>Email : ${email}</div>
	</div>
	<p style="align-self: center; padding: 5px;">${message}</p>
</div>
	`.trim();
}

export const sendContactEmail = action({
	args: {
		name: v.string(),
		email: v.string(),
		message: v.string(),
	},
	handler: async (_ctx, args) => {
		const name = args.name.charAt(0).toUpperCase() + args.name.toLowerCase().slice(1);
		const email = args.email.toLowerCase();

		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) {
			throw new Error("RESEND_API_KEY is not configured");
		}
		const resend = new Resend(apiKey);

		const sendToAdmin = await resend.emails.send({
			from: "Intobeing <info@intobeingplacements.co.za>",
			to: ["nexusthestaff@gmail.com"],
			subject: "Into-Being Website Contact Form Submission",
			html: contactUsAdminEmailHtml(name, email, args.message),
		});

		if (sendToAdmin.error) {
			console.error(sendToAdmin.error);
			throw sendToAdmin.error;
		}

		const confirmWithVisitor = await resend.emails.send({
			from: "Intobeing <info@intobeingplacements.co.za>",
			to: [email],
			subject: "Into-Being Placements",
			text: `Hello ${name},\n\nThank you for reaching out to us. We will get back to you as soon as possible.\n\nBest Regards,\nInto-Being Placements`,
		});

		if (confirmWithVisitor.error) {
			console.error(confirmWithVisitor.error);
			throw confirmWithVisitor.error;
		}

		return { message: "Email sent successfully" };
	},
});
