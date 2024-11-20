import { z } from "zod";

// Add this to ensure this code only runs on server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

const envSchema = z.object({
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
});
