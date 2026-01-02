import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Link, Redirect, useRouter } from "expo-router";

import { authClient } from "@/lib/auth-client";

export default function SignIn() {
    const router = useRouter();
    const { data: session, isPending: sessionPending } = authClient.useSession();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!sessionPending && session) {
        return <Redirect href="/(tabs)" />;
    }

    const handleLogin = () => {
        setError(null);

        authClient.signIn.email(
            { email, password },
            {
                onRequest: () => setLoading(true),
                onSuccess: () => {
                    router.replace("/(tabs)");
                },
                onError: (ctx) => {
                    setLoading(false)
                    setError(ctx.error.message ?? "Sign in failed");
                },
                onSettled: () => setLoading(false),
            },
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Welcome back. Please enter your details.</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                textContentType="emailAddress"
            />
            <TextInput
                placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            textContentType="password"
          />

      <Pressable onPress={() => router.push("/forgot-password")} style={styles.linkRow}>
        <Text style={styles.linkText}>Forgot your password?</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={handleLogin}
        style={({ pressed }) => [
                    styles.primaryButton,
                    (pressed || loading) && styles.primaryButtonPressed,
                ]}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>Continue</Text>
                )}
            </Pressable>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don&apos;t have an account?</Text>
                <Link href="/sign-up" style={styles.footerLink}>
                    Sign up
                </Link>
            </View>
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
    error: {
        color: "#b91c1c",
        fontSize: 14,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
    },
    footerText: {
        color: "#4a5568",
        fontSize: 14,
    },
  footerLink: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  linkRow: {
    alignItems: "flex-end",
  },
  linkText: {
    color: "#0ea5e9",
    fontWeight: "600",
  },
});
