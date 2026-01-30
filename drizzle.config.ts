import * as dotenv from "dotenv";
import { z } from "zod";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

const envSchema = z.object({
	DATABASE_URL: z.url(),
});

export const env = envSchema.parse({
	DATABASE_URL: process.env.DATABASE_URL,
});

export default defineConfig({
	out: "./drizzle",
	schema: "./db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
