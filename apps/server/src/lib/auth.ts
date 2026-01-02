import { sendResetPasswordEmail, sendWelcomeEmail } from "@/emails";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { appLogger } from "@/middleware/logger";
import * as userSchema from "@/db/schema/auth";
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { db } from "@/db";
import env from "@/env";
import { fa } from "zod/v4/locales";

const authLogLevel: "error" | "warn" | "info" | "debug" | undefined =
    env.LOG_LEVEL === "fatal" || env.LOG_LEVEL === "error" ? "error"
        : env.LOG_LEVEL === "warn" ? "warn"
            : env.LOG_LEVEL === "info" ? "info"
                : env.LOG_LEVEL === "debug" || env.LOG_LEVEL === "trace" ? "debug"
                    : undefined;

export const auth = betterAuth({
    appName: 'STEPS',
    account: {
        modelName: "account",

        encryptOAuthTokens: true,
        storeAccountCookie: true,
        accountLinking: {
            enabled: true,
            trustedProviders: ["email-password", "facebook", "google", "microsoft"],
            allowDifferentEmails: false
        }
    },
    advanced: {
        ipAddress: {
            ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
            disableIpTracking: false
        },
        useSecureCookies: true,
        disableCSRFCheck: false,
        defaultCookieAttributes: {
            httpOnly: true,
            secure: true
        },

    },
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/v1/auth",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            account: userSchema.account,
            session: userSchema.session,
            user: userSchema.user,
            verification: userSchema.verification
        }
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: false,
        sendResetPassword: async ({ user, url, token }) => {
            const webResetUrl = new URL(env.PASSWORD_RESET_WEB_URL);
            webResetUrl.searchParams.set("token", token);

            const nativeResetUrl = new URL(env.PASSWORD_RESET_NATIVE_URL);
            nativeResetUrl.searchParams.set("token", token);

            await sendResetPasswordEmail({
                to: user.email,
                name: user.name ?? undefined,
                webResetUrl: webResetUrl.toString(),
                nativeResetUrl: nativeResetUrl.toString(),
            });
        },
        resetPasswordTokenExpiresIn: 3600, // 1 hour
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            const webVerifyUrl = new URL(env.VERIFY_EMAIL_WEB_URL);
            webVerifyUrl.searchParams.set("token", token);

            await sendWelcomeEmail({
                to: user.email,
                name: user.name ?? undefined,
                actionUrl: webVerifyUrl.toString(),
                actionLabel: "Verify email",
            });
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: 3600
    },
    logger: {
        level: authLogLevel,
        log: (level, message, ...args) => {
            if (level === "warn") {
                appLogger.warn(message, ...args);
                return;
            }
            if (level === "error") {
                appLogger.error(message, ...args);
                return;
            }
            if (level === "debug") {
                appLogger.debug(message, ...args);
                return;
            }
            appLogger.info(message, ...args);
        },
    },
    plugins: [
        expo(),
        nextCookies()// make sure this is the last plugin in the array
    ],
    rateLimit: {
        enabled: true,
        window: 10,
        max: 100,
        storage: "memory",
        modelName: "rateLimit"
    },
    session: {
        modelName: "session",
        expiresIn: 604800, // 7 days
        updateAge: 86400, // 1 day
        disableSessionRefresh: true, // Disable session refresh so that the session is not updated regardless of the `updateAge` option. (default: `false`)
        storeSessionInDatabase: true, // Store session in database when secondary storage is provided (default: `false`)
        preserveSessionInDatabase: false, // Preserve session records in database when deleted from secondary storage (default: `false`)
        cookieCache: {
            enabled: true,
            maxAge: 300
        }
    },
    telemetry: {
        enabled: false,
    },
    trustedOrigins: env.CORS_ORIGINS,
    user: {
        modelName: "user",
        fields: {
            email: "email",
            name: "name"
        },
        changeEmail: {
            enabled: false,
        },
        deleteUser: {
            enabled: true,
            sendDeleteAccountVerification: async ({ user, url, token }) => {
                // Send delete account verification
            },
            beforeDelete: async (user) => {
                // Perform actions before user deletion
            },
            afterDelete: async (user) => {
                // Perform cleanup after user deletion
            }
        }
    },
});
