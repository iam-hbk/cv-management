import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  // Add other environment variables as needed
});

// This will throw an error if the environment variables are invalid
export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
}); 