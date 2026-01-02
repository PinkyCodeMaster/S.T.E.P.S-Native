"use client";

import { Field, FieldDescription, FieldGroup, FieldLabel, } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";

export function SignupForm({ className, ...props }: ComponentPropsWithoutRef<"form">) {

    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setInfo(null);

        await authClient.signUp.email(
            {
                email,
                password,
                name,
            },
            {
                onRequest: () => setLoading(true),
                onSuccess: () => {
                    toast.success("Account created. Please verify your email before signing in.");
                    setInfo("Check your email to verify your account, then sign in.");
                    router.push(`/verify-pending?email=${encodeURIComponent(email)}`);
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
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Fill in the form below to create your account
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Field>
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
                    <FieldDescription>
                        We&apos;ll use this to contact you. We will not share your email
                        with anyone else.
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldDescription>
                        Must be at least 8 characters long.
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                    <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <FieldDescription>Please confirm your password.</FieldDescription>
                </Field>
                {error ? (
                    <FieldDescription className="text-destructive">
                        {error}
                    </FieldDescription>
                ) : null}
                {info ? (
                    <FieldDescription className="text-foreground">
                        {info}
                    </FieldDescription>
                ) : null}
                <Field>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Account"}
                    </Button>
                </Field>
                <Field>
                    <FieldDescription className="px-6 text-center">
                        Already have an account? <a href="/sign-in">Sign in</a>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}
