import { useState, useRef, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet,
} from "react-native";
import { askCopilot, COPILOT_SUGGESTIONS, type CopilotMessage } from "@/lib/ai/copilot";

const BRAND = "#0EA5E9";

export default function CopilotScreen() {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = useCallback(async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const answer = await askCopilot(question);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      }]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Virhe: ${e.message ?? "Yhteysongelma. Yritä uudelleen."}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [input, loading]);

  const isEmpty = messages.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Copilot</Text>
            <Text style={styles.headerSub}>● Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
      >
        {isEmpty && (
          <View>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Hei valmentaja 👋</Text>
              <Text style={styles.welcomeBody}>
                Voin analysoida ryhmäsi harjoittelua, kisatuloksia ja kehitystä.
                Kysy mitä tahansa suomeksi.
              </Text>
            </View>
            <Text style={styles.suggestLabel}>KOKEILE NÄITÄ</Text>
            {COPILOT_SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionBtn}
                onPress={() => send(s)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {messages.map((m) => (
          <View
            key={m.id}
            style={[styles.msgRow, m.role === "user" ? styles.msgRowUser : styles.msgRowAssistant]}
          >
            {m.role === "assistant" && (
              <View style={styles.msgMeta}>
                <View style={styles.smallAvatar}>
                  <Text style={{ fontSize: 8 }}>🤖</Text>
                </View>
                <Text style={styles.msgMetaLabel}>Copilot</Text>
              </View>
            )}
            <View style={[
              styles.bubble,
              m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
            ]}>
              <Text style={[styles.bubbleText, m.role === "user" && styles.bubbleTextUser]}>
                {m.content}
              </Text>
            </View>
            <Text style={styles.msgTime}>
              {m.timestamp.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={styles.msgRowAssistant}>
            <View style={styles.msgMeta}>
              <View style={styles.smallAvatar}>
                <Text style={{ fontSize: 8 }}>🤖</Text>
              </View>
              <Text style={styles.msgMetaLabel}>Copilot</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleAssistant, styles.bubbleLoading]}>
              <ActivityIndicator size="small" color={BRAND} />
              <Text style={styles.loadingText}>Analysoidaan...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputArea}>
        {!isEmpty && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
            <View style={styles.quickChips}>
              {COPILOT_SUGGESTIONS.slice(0, 3).map(s => (
                <TouchableOpacity
                  key={s}
                  style={styles.chip}
                  onPress={() => send(s)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText} numberOfLines={1}>
                    {s.length > 30 ? s.slice(0, 28) + "…" : s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Kysy ryhmästäsi..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  // Header
  header: { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  headerInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarBox: { width: 40, height: 40, backgroundColor: BRAND, borderRadius: 12,
    alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 18 },
  headerTitle: { fontWeight: "700", fontSize: 15, color: "#111" },
  headerSub: { fontSize: 12, color: "#22C55E", fontWeight: "500" },

  // Welcome
  welcomeCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  welcomeTitle: { fontWeight: "600", color: "#1E293B", marginBottom: 4, fontSize: 15 },
  welcomeBody: { color: "#64748B", fontSize: 14, lineHeight: 20 },
  suggestLabel: { fontSize: 11, fontWeight: "700", color: "#94A3B8", marginBottom: 8, marginLeft: 4 },
  suggestionBtn: { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 14, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: "#F1F5F9" },
  suggestionText: { color: "#334155", fontSize: 14 },

  // Messages
  msgRow: { marginBottom: 12 },
  msgRowUser: { alignItems: "flex-end" },
  msgRowAssistant: { alignItems: "flex-start" },
  msgMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  smallAvatar: { width: 16, height: 16, backgroundColor: BRAND, borderRadius: 8,
    alignItems: "center", justifyContent: "center" },
  msgMetaLabel: { fontSize: 11, color: "#94A3B8" },
  bubble: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, maxWidth: "85%" },
  bubbleUser: { backgroundColor: BRAND, borderTopRightRadius: 4 },
  bubbleAssistant: { backgroundColor: "#fff", borderTopLeftRadius: 4,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  bubbleLoading: { flexDirection: "row", alignItems: "center", gap: 8 },
  bubbleText: { fontSize: 14, lineHeight: 20, color: "#1E293B" },
  bubbleTextUser: { color: "#fff" },
  loadingText: { color: "#94A3B8", fontSize: 14 },
  msgTime: { fontSize: 11, color: "#CBD5E1", marginTop: 4, marginHorizontal: 4 },

  // Input
  inputArea: { backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9",
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  quickRow: { marginBottom: 8 },
  quickChips: { flexDirection: "row", gap: 8 },
  chip: { backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, color: "#475569" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  textInput: { flex: 1, backgroundColor: "#F1F5F9", borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 14, color: "#1E293B", maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: BRAND,
    alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#E2E8F0" },
  sendBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
