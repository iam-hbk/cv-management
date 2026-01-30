import { z } from "zod";

// Add this to ensure this code only runs on server
if (typeof window !== "undefined") {
	throw new Error("This module can only be used on the server side");
}

const envSchema = z.object({
	DATABASE_URL: z.string(),
	BLOB_READ_WRITE_TOKEN: z.string().optional(),
	NEXT_PUBLIC_CV_GENERATION_API_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
	DATABASE_URL: process.env.DATABASE_URL,
	BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
	NEXT_PUBLIC_CV_GENERATION_API_URL: process.env.NEXT_PUBLIC_CV_GENERATION_API_URL,
});
