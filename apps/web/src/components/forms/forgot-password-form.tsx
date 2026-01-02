"use client";

import type { ComponentPropsWithoutRef, FormEvent } from "react";
import { useState } from "react";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:9000";
const RESET_PATH = "/api/v1/auth/request-password-reset";

export function ForgotPasswordForm({ className, ...props }: ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const redirectTo = `${window.location.origin}/reset-password`;

    try {
      const res = await fetch(`${AUTH_BASE}${RESET_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to send reset email");
      }

      setMessage("If this email exists, a reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email and we&apos;ll send you a reset link.
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
        {error ? (
          <FieldDescription className="text-destructive">
            {error}
          </FieldDescription>
        ) : null}
        {message ? (
          <FieldDescription className="text-foreground">
            {message}
          </FieldDescription>
        ) : null}
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Remembered?{" "}
            <a href="/sign-in" className="underline underline-offset-4">
              Back to sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
