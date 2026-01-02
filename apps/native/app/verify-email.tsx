import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const AUTH_BASE = process.env.EXPO_PUBLIC_AUTH_URL ?? "http://localhost:9000";
const VERIFY_ENDPOINT = "/api/v1/auth/verify-email";

export default function VerifyEmail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = typeof params.token === "string" ? params.token : "";

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      return;
    }

    setStatus("verifying");
    setMessage(null);

    try {
      const res = await fetch(`${AUTH_BASE}${VERIFY_ENDPOINT}?token=${encodeURIComponent(token)}`, {
        method: "GET",
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

  // Auto-run on mount
  if (status === "idle") {
    handleVerify();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify email</Text>
      <Text style={styles.subtitle}>
        We&apos;re completing your verification.
      </Text>

      {status === "verifying" && (
        <View style={styles.row}>
          <ActivityIndicator color="#111827" />
          <Text style={styles.text}>Verifying token...</Text>
        </View>
      )}
      {status === "success" && (
        <Text style={styles.success}>{message}</Text>
      )}
      {status === "error" && (
        <Text style={styles.error}>{message}</Text>
      )}

      <Pressable
        onPress={() => router.replace("/sign-in")}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
        ]}
      >
        <Text style={styles.primaryButtonText}>Go to sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    color: "#4a5568",
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#b91c1c",
    fontSize: 14,
  },
  success: {
    color: "#15803d",
    fontSize: 14,
  },
});
