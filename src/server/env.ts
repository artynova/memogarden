import {z} from "zod";

const envSchema = z.object({
    DB_USER: z.string().min(1).default("postgres"),
    DB_PASSWORD: z.string().min(1),
    DB_HOST: z.string().min(1).default("localhost"),
    DB_PORT: z.coerce.number().min(1000).max(65535).default(5432),
    DB_NAME: z.string().min(1).default("postgres"),
    ENV: z
        .union([
            z.literal("development"),
            z.literal("testing"),
            z.literal("production"),
        ])
        .default("development"),
});

const env = envSchema.parse(process.env);

export default env;
