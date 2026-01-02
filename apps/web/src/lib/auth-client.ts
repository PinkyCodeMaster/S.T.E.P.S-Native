import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:9000",
    basePath: "/api/v1/auth"
})


export type Session = typeof authClient.$Infer.Session