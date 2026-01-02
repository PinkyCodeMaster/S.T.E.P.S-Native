import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

const mailLinks = [
  { label: "Gmail", href: "https://mail.google.com/mail/u/0/#inbox" },
  { label: "Outlook", href: "https://outlook.live.com/mail/0/inbox" },
  { label: "iCloud Mail", href: "https://www.icloud.com/mail" },
  { label: "Open mail app", href: "mailto:" },
];

export default function VerifyPending() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = typeof params.email === "string" ? params.email : "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We sent a verification link{email ? ` to ${email}` : ""}. Open your email to verify, then sign in.
      </Text>

      <View style={styles.links}>
        {mailLinks.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => Linking.openURL(link.href)}
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.linkButtonPressed,
            ]}
          >
            <Text style={styles.linkText}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.replace("/sign-in")} style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryButtonPressed,
      ]}>
        <Text style={styles.primaryButtonText}>Back to sign in</Text>
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
  links: {
    marginVertical: 12,
    gap: 8,
  },
  linkButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  linkButtonPressed: {
    backgroundColor: "#f3f4f6",
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
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
});
