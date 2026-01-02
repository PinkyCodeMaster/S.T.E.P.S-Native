/** @jsxImportSource react */
import * as React from "react";
import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";

type ResetPasswordEmailProps = {
  name?: string;
  webResetUrl: string;
  nativeResetUrl?: string;
};

export function ResetPasswordEmail({ name = "there", webResetUrl, nativeResetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.h1}>Reset your password</Text>
            <Text style={styles.muted}>Hi {name}, we received a request to reset your password.</Text>
          </Section>

          <Section style={styles.section}>
            <Text style={styles.text}>Web</Text>
            <Button href={webResetUrl} style={styles.primaryButton}>
              Open reset page
            </Button>
            <Text style={styles.muted}>{webResetUrl}</Text>
          </Section>

          {nativeResetUrl ? (
            <Section style={styles.section}>
              <Text style={styles.text}>Mobile (Expo)</Text>
              <Button href={nativeResetUrl} style={styles.secondaryButton}>
                Open in app
              </Button>
              <Text style={styles.muted}>{nativeResetUrl}</Text>
            </Section>
          ) : null}

          <Hr style={styles.hr} />
          <Text style={styles.muted}>If you didn&apos;t request this, you can ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f8fb",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "24px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "32px",
    margin: "0 auto",
    maxWidth: "520px",
  },
  header: {
    marginBottom: "20px",
  },
  h1: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  text: {
    fontSize: "16px",
    color: "#0f172a",
    marginBottom: "12px",
  },
  muted: {
    fontSize: "14px",
    color: "#475569",
    margin: "8px 0",
    wordBreak: "break-all" as const,
  },
  section: {
    marginBottom: "24px",
  },
  primaryButton: {
    display: "inline-block",
    backgroundColor: "#111827",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 600,
  },
  secondaryButton: {
    display: "inline-block",
    backgroundColor: "#0ea5e9",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 600,
  },
  hr: {
    borderColor: "#e2e8f0",
    margin: "24px 0",
  },
};

export default ResetPasswordEmail;
