import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const AUTH_BASE = process.env.EXPO_PUBLIC_AUTH_URL ?? "http://localhost:9000";
const RESET_ENDPOINT = "/api/v1/auth/reset-password";

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = typeof params.token === "string" ? params.token : "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!token) {
      setError("Reset token missing or invalid.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${AUTH_BASE}${RESET_ENDPOINT}?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to reset password");
      }

      router.replace("/sign-in");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>Choose a new password for your account.</Text>

      <TextInput
        placeholder="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        textContentType="newPassword"
      />
      <TextInput
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
        textContentType="newPassword"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
          <Text style={styles.primaryButtonText}>Reset password</Text>
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
});
