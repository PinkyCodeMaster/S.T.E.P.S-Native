/** @jsxImportSource react */

import { ResetPasswordEmail } from "./templates/reset-password";
import { WelcomeEmail } from "./templates/welcome-email";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import * as React from "react";
import env from "@/env";

const from = env.RESEND_FROM_EMAIL;

const mailpitTransport = nodemailer.createTransport({
  host: env.MAILPIT_HOST,
  port: env.MAILPIT_PORT,
  secure: false,
  auth: env.MAILPIT_USER && env.MAILPIT_PASS ? { user: env.MAILPIT_USER, pass: env.MAILPIT_PASS } : undefined,
});

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const useResend = env.NODE_ENV === "production" && !!resend;

async function sendEmail(options: { to: string; subject: string; react: React.ReactElement }) {
  const html = render(options.react);

  if (useResend && resend) {
    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      react: options.react,
    });
    if (error) throw error;
    return data;
  }

  return mailpitTransport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html,
  });
}

export async function sendResetPasswordEmail(options: {
  to: string;
  name?: string;
  webResetUrl: string;
  nativeResetUrl?: string;
}) {
  return sendEmail({
    to: options.to,
    subject: "Reset your password",
    react: (
      <ResetPasswordEmail
        name={options.name}
        webResetUrl={options.webResetUrl}
        nativeResetUrl={options.nativeResetUrl}
      />
    ),
  });
}

export async function sendWelcomeEmail(options: {
  to: string;
  name?: string;
  actionUrl?: string;
  actionLabel?: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
}) {
  return sendEmail({
    to: options.to,
    subject: "Welcome to STEPS",
    react: (
      <WelcomeEmail
        name={options.name}
        actionUrl={options.actionUrl}
        actionLabel={options.actionLabel}
        secondaryUrl={options.secondaryUrl}
        secondaryLabel={options.secondaryLabel}
      />
    ),
  });
}
