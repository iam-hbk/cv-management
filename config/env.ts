import { z } from "zod";

// Add this to ensure this code only runs on server
if (typeof window !== "undefined") {
	throw new Error("This module can only be used on the server side");
}

const envSchema = z.object({
	NEXT_PUBLIC_CV_GENERATION_API_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
	NEXT_PUBLIC_CV_GENERATION_API_URL: process.env.NEXT_PUBLIC_CV_GENERATION_API_URL,
});
