import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(config({
    path: path.resolve(
        process.cwd(),
        process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    ),
}));

const DEFAULT_CORS_ORIGINS = ["http://localhost:3000"];

const EnvSchema = z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(9000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
    DATABASE_URL: z.url(),
    CORS_ORIGINS: z.string().default(DEFAULT_CORS_ORIGINS.join(",")).transform((origins) => {
        const parsedOrigins = origins.split(",").map((origin) => origin.trim()).filter(Boolean);
        return parsedOrigins.length ? parsedOrigins : DEFAULT_CORS_ORIGINS;
    }),
    BETTER_AUTH_URL: z.url().default('http://localhost:9000'),
    BETTER_AUTH_SECRET: z.string(),
    PASSWORD_RESET_WEB_URL: z.string().url().default("http://localhost:3001/reset-password"),
    // Native deep link (expo scheme). We don't enforce URL format to allow custom schemes.
    PASSWORD_RESET_NATIVE_URL: z.string().default("exp://192.168.0.27:8081/--/reset-password"),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL must be a valid email").default("dev@steps.local"),
    MAILPIT_HOST: z.string().default("127.0.0.1"),
    MAILPIT_PORT: z.coerce.number().default(1025),
    MAILPIT_USER: z.string().optional(),
    MAILPIT_PASS: z.string().optional(),
    VERIFY_EMAIL_WEB_URL: z.string().url().default("http://localhost:3000/verify-email"),
});

export type env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
    console.error("Invalid env:");
    console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
    process.exit(1);
}

export default env!;
