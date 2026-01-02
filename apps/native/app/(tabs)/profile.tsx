import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image, StyleSheet, TouchableWithoutFeedback, Keyboard, } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

type ListAccountsResult = Awaited<ReturnType<typeof authClient.listAccounts>>;
type Account =
  ListAccountsResult extends { data: (infer U)[] | null | undefined }
    ? U
    : { id: string; providerId: string; email?: string | null };

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* ───────────────── Load user ───────────────── */

  useEffect(() => {
    async function load() {
      const { data: session } = await authClient.getSession();
      if (!session?.user) {
        router.replace("/sign-in");
        return;
      }

      setUser(session.user);
      setName(session.user.name ?? "");
      setImage(session.user.image ?? "");

      const { data: accs, error: accsErr } = await authClient.listAccounts();
      setAccountsError(accsErr?.message ?? null);
      setAccounts(Array.isArray(accs) ? accs : []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading…</Text>
      </View>
    );
  }

  /* ───────────────── Actions ───────────────── */

  async function updateProfile() {
    try {
      setSaving(true);
      await authClient.updateUser({
        name,
        image,
      });
      Alert.alert("Updated", "Profile updated successfully");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      Alert.alert("Success", "Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to change password");
    }
  }

  async function unlinkAccount(providerId: string) {
    Alert.alert(
      "Unlink account",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            await authClient.unlinkAccount({ providerId });
            const { data: accs, error: accsErr } = await authClient.listAccounts();
            setAccountsError(accsErr?.message ?? null);
            setAccounts(Array.isArray(accs) ? accs : []);
          },
        },
      ]
    );
  }

  async function deleteAccount() {
    Alert.alert(
      "Delete account",
      "This permanently deletes your account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await authClient.deleteUser({
              callbackURL: "/goodbye",
            });
          },
        },
      ]
    );
  }

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.replace("/sign-in"),
      },
    });
  }

  /* ───────────────── UI ───────────────── */

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account</Text>

      {/* Profile */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Image
            source={
              image
                ? { uri: image }
                : require("@/assets/avatar-placeholder.png")
            }
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* TODO: swap placeholder with MinIO-hosted URL once uploads are wired */}
        <Text style={styles.label}>Avatar URL</Text>
        <TextInput
          style={styles.input}
          value={image}
          onChangeText={setImage}
        />

        <TouchableOpacity
          style={[styles.button, styles.primary]}
          onPress={updateProfile}
          disabled={saving}
        >
          <Text style={styles.buttonText}>Save profile</Text>
        </TouchableOpacity>
      </View>

      {/* Email (read-only) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Email</Text>
        <Text style={styles.meta}>{user.email}</Text>
      </View>

      {/* Password */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Current password"
          placeholderTextColor="#777"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="New password"
          placeholderTextColor="#777"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={changePassword}
        >
          <Text style={styles.buttonText}>Update password</Text>
        </TouchableOpacity>
      </View>

      {/* Linked accounts */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Linked accounts</Text>

        {accountsError ? <Text style={styles.meta}>{accountsError}</Text> : null}
        {accounts.length === 0 ? (
          <Text style={styles.meta}>No linked accounts yet.</Text>
        ) : (
          // Hide unlink when there is only a single linked account
          accounts.length === 1
            ? accounts.map((acc: Account) => (
              <View key={acc.id} style={styles.accountRow}>
                <View>
                  <Text style={styles.text}>{acc.providerId}</Text>
                  {acc.email ? <Text style={styles.meta}>{acc.email}</Text> : null}
                </View>
              </View>
            ))
            :
          accounts.map((acc: Account) => (
            <View key={acc.id} style={styles.accountRow}>
              <View>
                <Text style={styles.text}>{acc.providerId}</Text>
                {acc.email ? <Text style={styles.meta}>{acc.email}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => unlinkAccount(acc.providerId)}>
                <Text style={styles.unlink}>Unlink</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={[styles.button, styles.secondary, { marginTop: 12, marginBottom: 24 }]}
        onPress={signOut}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>

      {/* Danger zone */}
      <View style={styles.danger}>
        <Text style={styles.dangerTitle}>Danger zone</Text>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={deleteAccount}
        >
          <Text style={styles.buttonText}>Delete account</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

/* ───────────────── Styles ───────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    padding: 20,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: "#E6E9EF" },
  subtitle: { color: "#9AA4BF", marginBottom: 20 },
  text: { color: "#E6E9EF" },
  meta: { color: "#9AA4BF", fontSize: 13 },

  card: {
    backgroundColor: "#121826",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#333" },

  label: { color: "#9AA4BF", fontSize: 12, marginBottom: 4 },
  input: {
    backgroundColor: "#0F1522",
    borderRadius: 8,
    padding: 12,
    color: "#E6E9EF",
    marginBottom: 12,
  },

  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primary: { backgroundColor: "#4F8CFF" },
  secondary: { backgroundColor: "#1A2133" },
  dangerButton: { backgroundColor: "#EF4444" },
  buttonText: { color: "#FFF", fontWeight: "600" },

  sectionTitle: {
    color: "#E6E9EF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#25304A",
  },
  unlink: { color: "#EF4444", fontWeight: "500" },

  danger: {
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  dangerTitle: { color: "#EF4444", fontWeight: "700", marginBottom: 12 },
});
