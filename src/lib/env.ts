import { z } from "zod";

// Validate public environment variables
const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("https://google-drive-api.aniketxz.dev"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
