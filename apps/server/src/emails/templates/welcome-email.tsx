/** @jsxImportSource react */
import * as React from "react";
import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";

type WelcomeEmailProps = {
  name?: string;
  actionUrl?: string;
  actionLabel?: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
};

export function WelcomeEmail({
  name = "there",
  actionUrl,
  actionLabel = "Open STEPS",
  secondaryUrl,
  secondaryLabel = "Open in app",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to STEPS</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.h1}>Welcome to STEPS</Text>
            <Text style={styles.muted}>Hi {name}, thanks for joining us!</Text>
          </Section>

          <Section style={styles.section}>
            <Text style={styles.text}>
              We&apos;re excited to have you on board. You can sign in on the web or mobile any time.
            </Text>
            {actionUrl ? (
              <Button href={actionUrl} style={styles.primaryButton}>
                {actionLabel}
              </Button>
            ) : null}

            {secondaryUrl ? (
              <Button href={secondaryUrl} style={styles.secondaryButton}>
                {secondaryLabel}
              </Button>
            ) : null}
          </Section>

          <Hr style={styles.hr} />
          <Text style={styles.muted}>If you have any questions, just reply to this email.</Text>
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
    marginTop: "10px",
  },
  hr: {
    borderColor: "#e2e8f0",
    margin: "24px 0",
  },
};

export default WelcomeEmail;
