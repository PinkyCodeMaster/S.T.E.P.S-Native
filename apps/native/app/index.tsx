import { Link, Redirect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authClient } from "@/lib/auth-client";

export default function Welcome() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View style={styles.container}>
        <Text style={styles.body}>Checking your session...</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to STEPS</Text>
      <Text style={styles.body}>
        Sign up to get started or sign in if you already have an account.
      </Text>

      <Link href="/sign-up" asChild>
        <Pressable style={styles.primary}>
          <Text style={styles.primaryText}>Get Started</Text>
        </Pressable>
      </Link>

      <Link href="/sign-in" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>I already have an account</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: "#4a5568",
    textAlign: "center",
  },
  primary: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: "100%",
    alignItems: "center",
  },
  secondaryText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "500",
  },
});
