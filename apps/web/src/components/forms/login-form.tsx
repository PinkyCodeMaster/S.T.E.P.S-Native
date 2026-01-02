"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, FormEvent } from "react";
import { useState } from "react";

export function LoginForm({ className, ...props }: ComponentPropsWithoutRef<"form">) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        await authClient.signIn.email(
            {
                email,
                password,
                callbackURL: "/dashboard",
                rememberMe: true,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    toast.success("Signed in");
                    router.push("/dashboard");
                },
                onError: (ctx) => {
                    setError(ctx.error.message);
                    toast.error(ctx.error.message);
                },
            },
        );

        setLoading(false);
    };

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Login to your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your email below to login to your account
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <a href="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline" >
                            Forgot your password?
                        </a>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Field>
                {error ? (
                    <FieldDescription className="text-destructive">
                        {error}
                    </FieldDescription>
                ) : null}
                <Field>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </Field>
                <Field>
                    <FieldDescription className="text-center">
                        Don&apos;t have an account?{" "}
                        <a href="/sign-up" className="underline underline-offset-4">
                            Sign up
                        </a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}
