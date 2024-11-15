import { z } from "zod";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); // Read environment variables for contexts where Next.js's import are not present (e.g., Drizzle config)

const envSchema = z.object({
    ENV: z
        .union([z.literal("development"), z.literal("testing"), z.literal("production")])
        .default("development"),

    // Database
    DB_USER: z.string().min(1).default("postgres"),
    DB_PASSWORD: z.string(),
    DB_HOST: z.string().min(1).default("localhost"),
    DB_PORT: z.coerce.number().min(1000).max(65535).default(5432),
    DB_NAME: z.string().min(1).default("postgres"),

    // Auth
    AUTH_URL: z.string().min(1),
    AUTH_SECRET: z.string().base64().length(44, {
        message: "Must represent a 32-byte number (i.e., have string length of 44)",
    }),
    AUTH_PASSWORD_SALT_ROUNDS: z.coerce.number().min(1).max(20).default(12),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_FACEBOOK_ID: z.string().min(1),
    AUTH_FACEBOOK_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
