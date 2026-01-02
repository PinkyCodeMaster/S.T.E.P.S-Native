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

export default function SignUp() {
    const router = useRouter();
    const { data: session, isPending: sessionPending } = authClient.useSession();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    if (!sessionPending && session) {
        return <Redirect href="/(tabs)" />;
    }

    const handleSignUp = () => {
        setError(null);
        setInfo(null);

        authClient.signUp.email(
            { email, password, name },
            {
                onRequest: () => setLoading(true),
                onSuccess: () => {
                    setLoading(false);
                    setInfo("Account created. Verify your email, then sign in.");
                    router.replace(`/verify-pending?email=${encodeURIComponent(email)}`);
                },
                onError: (ctx) => {
                    setError(ctx.error.message ?? "Sign up failed");
                },
                onSettled: () => setLoading(false),
            },
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start your STEPS journey.</Text>

            <TextInput
                placeholder="Full name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                textContentType="name"
            />
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
                textContentType="newPassword"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.success}>{info}</Text> : null}

            <Pressable
                onPress={handleSignUp}
                style={({ pressed }) => [
                    styles.primaryButton,
                    (pressed || loading) && styles.primaryButtonPressed,
                ]}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>Create account</Text>
                )}
            </Pressable>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Link href="/sign-in" style={styles.footerLink}>
                    Sign in
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
    success: {
        color: "#15803d",
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
});
