import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { signIn } from "@/lib/queries/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) Alert.alert("Virhe kirjautumisessa", error.message);
    setLoading(false);
  }

  return (
    <View style={s.root}>
      <View style={s.logoWrap}>
        <Text style={s.logo}>🏊</Text>
        <Text style={s.appName}>SwimCoach</Text>
        <Text style={s.tagline}>Kirjaudu sisään</Text>
      </View>

      <View style={s.form}>
        <TextInput
          style={s.input}
          placeholder="Sähköposti"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={s.input}
          placeholder="Salasana"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[s.btn, loading && s.btnDisabled]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={s.btnText}>
            {loading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 56,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0EA5E9",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: "#94a3b8",
    marginTop: 4,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  btn: {
    backgroundColor: "#0EA5E9",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});
