"use node";

import { type GenericCtx, createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { Resend } from "resend";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

const defaultTrustedOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:3002",
	"https://cv-management-five.vercel.app",
	"https://intobeingplacements.co.za",
	"https://*.intobeingplacements.co.za",
];

// Trusted origins for Better Auth (prevents INVALID_ORIGIN errors)
const trustedOrigins = (
	process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? defaultTrustedOrigins
)
	.map((origin) => origin.trim())
	.filter(Boolean);

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

// Password reset email HTML template
function resetPasswordEmailHtml(url: string, userName: string): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
		<h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
	</div>
	<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
		<p style="margin-bottom: 20px;">Hello ${userName},</p>
		<p style="margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password:</p>
		<div style="text-align: center; margin: 30px 0;">
			<a href="${url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
		</div>
		<p style="margin-bottom: 20px; font-size: 14px; color: #666;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
		<p style="margin-bottom: 20px; font-size: 14px; color: #666;">This link will expire in 1 hour for security reasons.</p>
		<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
		<p style="font-size: 12px; color: #999; text-align: center;">Into-Being Placements</p>
	</div>
</body>
</html>
	`.trim();
}

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth({
		baseURL: siteUrl,
		trustedOrigins,
		database: authComponent.adapter(ctx),
		// Configure email/password with password reset
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			sendResetPassword: async ({ user, url }) => {
				const apiKey = process.env.RESEND_API_KEY;
				if (!apiKey) {
					console.error("RESEND_API_KEY is not configured");
					throw new Error("Email service not configured");
				}

				const resend = new Resend(apiKey);
				const result = await resend.emails.send({
					from: "Into-Being <info@intobeingplacements.co.za>",
					to: [user.email],
					subject: "Reset Your Password - Into-Being Placements",
					html: resetPasswordEmailHtml(url, user.name || "there"),
				});

				if (result.error) {
					console.error("Failed to send password reset email:", result.error);
					throw new Error("Failed to send password reset email");
				}
			},
		},
		plugins: [
			// The Convex plugin is required for Convex compatibility
			convex({ authConfig }),
		],
	});
};
