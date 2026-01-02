"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:9000";
const VERIFY_ENDPOINT = "/api/v1/auth/verify-email";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      setMessage(null);
      try {
        const res = await fetch(`${AUTH_BASE}${VERIFY_ENDPOINT}?token=${encodeURIComponent(token)}`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Verification failed");
        }
        setStatus("success");
        setMessage("Email verified. You can sign in now.");
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Something went wrong");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex flex-col gap-4 p-6 md:p-10">
      <div className="flex justify-center gap-2 md:justify-start">
        <a href="/" className="flex items-center gap-2 font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          STEPS
        </a>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xs">
          <div className="flex flex-col items-center gap-3 text-center rounded-lg border border-border px-6 py-8">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="text-sm text-muted-foreground">
              We&apos;re completing your verification.
            </p>
            {status === "verifying" && (
              <p className="text-sm text-muted-foreground">Verifying token...</p>
            )}
            {status === "success" && (
              <p className="text-sm text-foreground">{message}</p>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive">{message}</p>
            )}
            <a
              className="mt-2 text-sm font-semibold text-primary underline underline-offset-4"
              href="/sign-in"
            >
              Go to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
