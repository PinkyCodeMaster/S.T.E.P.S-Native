"use client";

import { useSearchParams } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";

const mailLinks = [
  { label: "Gmail", href: "https://mail.google.com/mail/u/0/#inbox" },
  { label: "Outlook", href: "https://outlook.live.com/mail/0/inbox" },
  { label: "iCloud Mail", href: "https://www.icloud.com/mail" },
  { label: "Open mail app", href: "mailto:" },
];

export default function VerifyPendingPage() {
  const params = useSearchParams();
  const email = params.get("email");

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
        <div className="w-full max-w-md rounded-lg border border-border px-6 py-8 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a verification link{email ? ` to ${email}` : ""}. Open your email to verify, then sign in.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {mailLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Didn&apos;t get it? Check your spam folder or try again.
          </p>
          <a
            className="mt-4 inline-flex justify-center text-sm font-semibold text-primary underline underline-offset-4"
            href="/sign-in"
          >
            Back to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
