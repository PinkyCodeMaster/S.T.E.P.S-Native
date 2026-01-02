import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

const AUTH_BASE = process.env.EXPO_PUBLIC_AUTH_URL ?? "http://localhost:9000";

export const authClient = createAuthClient({
    baseURL: AUTH_BASE,
    basePath: '/api/v1/auth',
    plugins: [
        expoClient({
            scheme: "native",
            storagePrefix: "native",
            storage: SecureStore,
        })
    ]
});



export type Session = typeof authClient.$Infer.Session