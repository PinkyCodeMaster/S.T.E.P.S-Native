import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { authClient } from "@/lib/auth-client";

const API_BASE = process.env.EXPO_PUBLIC_AUTH_URL ?? "http://localhost:9000";

// Build auth headers from the Better Auth session token.
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data: session } = await authClient.getSession();
  const token =
    (session as any)?.session?.token ??
    (session as any)?.sessionToken ??
    (session as any)?.token ??
    null;
  if (!token) {
    console.log("No auth token found in session");
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
    Cookie: `__Secure-better-auth.session_token=${token}`,
  };
};

const apiFetch = async (path: string, options?: RequestInit) => {
  const authHeaders = await getAuthHeaders();
  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(authHeaders ?? {}),
    ...((options?.headers as Record<string, string> | undefined) ?? {}),
  };
  return fetch(`${API_BASE}/api/v1${path}`, {
    ...options,
    headers: mergedHeaders,
    credentials: "include",
  });
};


type IncomeItem = {
  id: string;
  label: string;
  sourceType: string;
  monthlyAmountCents: number;
};

type Summary = {
  monthlyIncome: number;
  monthlyWages: number;
  monthlyBenefits: number;
  monthlyOther: number;
  monthlyUc: number;
  ucReduction: number;
  ucAfterTaper: number;
  netAfterUc: number;
};

const sourceOptions = [
  { label: "Wage", value: "wage" },
  { label: "Universal Credit", value: "universalCredit" },
  { label: "Benefit", value: "benefit" },
  { label: "Other", value: "other" },
];

const frequencyOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Fortnightly", value: "fortnightly" },
  { label: "Four weekly", value: "fourWeekly" },
  { label: "Annual", value: "annual" },
  { label: "Hourly", value: "hourly" },
];

const hoursPeriodOptions = [
  { label: "Weekly", value: "weekly" },
  { label: "Fortnightly", value: "fortnightly" },
  { label: "Monthly", value: "monthly" },
];

export default function IncomeScreen() {
  const { data: session } = authClient.useSession();

  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [sourceType, setSourceType] = useState("wage");
  const [frequency, setFrequency] = useState("monthly");
  const [hoursPerPeriod, setHoursPerPeriod] = useState("");
  const [hoursPeriod, setHoursPeriod] = useState("weekly");

  const [items, setItems] = useState<IncomeItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      refresh();
    }
  }, [session]);

  const refresh = async () => {
    setLoading(true);
    await Promise.all([loadList(), loadSummary()]);
    setLoading(false);
  };

  const loadList = async () => {
    const res = await apiFetch("/incomes", { method: "GET" });
    if (!res.ok) {
      const msg = await res.text();
      console.log("list incomes failed", res.status, msg);
      Alert.alert("Error", "Unable to load incomes");
      return;
    }
    const json = (await res.json()) as any;
    setItems(json.data ?? []);
  };

  const loadSummary = async () => {
    const res = await apiFetch("/incomes/summary", { method: "GET" });
    if (!res.ok) {
      const msg = await res.text();
      console.log("summary failed", res.status, msg);
      return;
    }
    const json = (await res.json()) as any;
    setSummary(json.totals ?? null);
  };

  const createIncome = async () => {
    if (!label || !amount) {
      Alert.alert("Missing fields", "Please add a label and amount.");
      return;
    }
    const res = await apiFetch("/incomes", {
      method: "POST",
      body: JSON.stringify({
        label,
        sourceType,
        amount: Number(amount),
        amountType: "net",
        frequency,
        hoursPerPeriod: hoursPerPeriod ? Number(hoursPerPeriod) : undefined,
        hoursPeriod: frequency === "hourly" ? hoursPeriod : undefined,
      }),
    });
    if (!res.ok) {
      const msg = await res.text();
      console.log("create income failed", res.status, msg);
      Alert.alert("Error", "Could not save income");
      return;
    }
    setLabel("");
    setAmount("");
    setHoursPerPeriod("");
    await refresh();
  };

  const deleteIncome = async (id: string) => {
    const res = await apiFetch(`/incomes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const msg = await res.text();
      console.log("delete income failed", res.status, msg);
      Alert.alert("Error", "Could not delete income");
      return;
    }
    await refresh();
  };

  const formatMoney = (cents: number) =>
    `£${(cents / 100).toFixed(2)}`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Income</Text>
        <Text style={styles.subtitle}>Track your income and UC taper.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add income</Text>
          <TextInput
            style={styles.input}
            placeholder="Label (e.g. June wages)"
            placeholderTextColor="#666"
            value={label}
            onChangeText={setLabel}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount (e.g. 1200)"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.label}>Source</Text>
          <View style={styles.row}>
            {sourceOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  sourceType === opt.value && styles.chipActive,
                ]}
                onPress={() => setSourceType(opt.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    sourceType === opt.value && styles.chipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Frequency</Text>
          <View style={styles.row}>
            {frequencyOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chipSmall,
                  frequency === opt.value && styles.chipActive,
                ]}
                onPress={() => setFrequency(opt.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    frequency === opt.value && styles.chipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {frequency === "hourly" ? (
            <>
              <Text style={styles.label}>Hours per period</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 30"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={hoursPerPeriod}
                onChangeText={setHoursPerPeriod}
              />
              <Text style={styles.label}>Hours period</Text>
              <View style={styles.row}>
                {hoursPeriodOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.chip,
                      hoursPeriod === opt.value && styles.chipActive,
                    ]}
                    onPress={() => setHoursPeriod(opt.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        hoursPeriod === opt.value && styles.chipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          <TouchableOpacity style={styles.primary} onPress={createIncome} disabled={loading}>
            <Text style={styles.primaryText}>{loading ? "Saving..." : "Save income"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your incomes</Text>
          {items.length === 0 ? (
            <Text style={styles.meta}>No incomes yet.</Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.listRow}>
                <View>
                  <Text style={styles.text}>{item.label}</Text>
                  <Text style={styles.meta}>
                    {item.sourceType} · {formatMoney(item.monthlyAmountCents)} / month
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteIncome(item.id)}>
                  <Text style={styles.unlink}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Summary</Text>
          {summary ? (
            <>
              <Text style={styles.meta}>Monthly total: {formatMoney(summary.monthlyIncome)}</Text>
              <Text style={styles.meta}>Wages: {formatMoney(summary.monthlyWages)}</Text>
              <Text style={styles.meta}>Benefits: {formatMoney(summary.monthlyBenefits)}</Text>
              <Text style={styles.meta}>Other: {formatMoney(summary.monthlyOther)}</Text>
              <Text style={styles.meta}>Universal Credit: {formatMoney(summary.monthlyUc)}</Text>
              <Text style={styles.meta}>UC reduction: {formatMoney(summary.ucReduction)}</Text>
              <Text style={styles.meta}>UC after taper: {formatMoney(summary.ucAfterTaper)}</Text>
              <Text style={styles.meta}>Net after UC: {formatMoney(summary.netAfterUc)}</Text>
            </>
          ) : (
            <Text style={styles.meta}>No data yet.</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    padding: 16,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#E6E9EF" },
  subtitle: { color: "#9AA4BF", marginBottom: 12 },
  card: {
    backgroundColor: "#121826",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { color: "#E6E9EF", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "#0F1522",
    borderRadius: 8,
    padding: 12,
    color: "#E6E9EF",
    marginBottom: 10,
  },
  label: { color: "#9AA4BF", fontSize: 12, marginBottom: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#0F1522",
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#0F1522",
    marginBottom: 6,
  },
  chipActive: { backgroundColor: "#4F8CFF" },
  chipText: { color: "#E6E9EF", fontSize: 12 },
  chipTextActive: { color: "#0B0F14", fontWeight: "700" },
  primary: {
    marginTop: 8,
    backgroundColor: "#4F8CFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: { color: "#0B0F14", fontWeight: "700" },
  text: { color: "#E6E9EF" },
  meta: { color: "#9AA4BF", fontSize: 12, marginTop: 2 },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#25304A",
  },
  unlink: { color: "#EF4444", fontWeight: "600" },
});
