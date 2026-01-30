import { z } from "zod";

/**
 * Client-side environment configuration
 * These variables are exposed to the browser via NEXT_PUBLIC_ prefix
 */
const clientEnvSchema = z.object({
	NEXT_PUBLIC_CV_GENERATION_API_URL: z.string().url().default("http://127.0.0.1:8000"),
});

export const clientEnv = clientEnvSchema.parse({
	NEXT_PUBLIC_CV_GENERATION_API_URL:
		process.env.NEXT_PUBLIC_CV_GENERATION_API_URL || "http://127.0.0.1:8000",
});
