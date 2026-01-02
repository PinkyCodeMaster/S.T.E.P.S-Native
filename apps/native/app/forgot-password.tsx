import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const AUTH_BASE = process.env.EXPO_PUBLIC_AUTH_URL ?? "http://localhost:9000";
const REQUEST_ENDPOINT = "/api/v1/auth/request-password-reset";
const RESET_REDIRECT = process.env.EXPO_PUBLIC_NATIVE_RESET_URL ?? "exp://localhost:9000/reset-password";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    const redirectTo = RESET_REDIRECT;

    try {
      const res = await fetch(`${AUTH_BASE}${REQUEST_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to send reset link");
      }

      setMessage("If this email exists, a reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <Text style={styles.subtitle}>Enter your email and we&apos;ll send you a reset link.</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        textContentType="emailAddress"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.primaryButton,
          (pressed || loading) && styles.primaryButtonPressed,
        ]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Send reset link</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.replace("/sign-in")} style={styles.secondary}>
        <Text style={styles.secondaryText}>Back to sign in</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
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
  secondary: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "500",
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
