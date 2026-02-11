import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [convexClient()],
});

/**
 * Request a password reset email.
 * This calls the /api/auth/request-password-reset endpoint.
 */
export async function requestPasswordReset(email: string, redirectTo?: string) {
	const response = await authClient.$fetch<{ status: boolean; message: string }>(
		"/request-password-reset",
		{
			method: "POST",
			body: {
				email,
				redirectTo: redirectTo ?? "/reset-password",
			},
		}
	);
	return response;
}

/**
 * Reset password with a token.
 * This calls the /api/auth/reset-password endpoint.
 */
export async function resetPassword(newPassword: string, token: string) {
	const response = await authClient.$fetch<{ status: boolean }>("/reset-password", {
		method: "POST",
		body: {
			newPassword,
			token,
		},
	});
	return response;
}
