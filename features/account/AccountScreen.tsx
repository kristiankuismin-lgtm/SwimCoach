import { View, StyleSheet } from "react-native";
import { LogOut } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { type UserRole } from "@/hooks/useAuth";
import { color, space } from "@/constants/theme";

const ROLE_LABEL: Record<UserRole, string> = {
  coach: "Valmentaja",
  club_admin: "Seuran ylläpitäjä",
  swimmer: "Uimari",
};

interface Props {
  email: string | null;
  role: UserRole | null;
  onSignOut: () => void;
}

/**
 * Tili — the account tab. Holds sign-out today; the home for profile, club
 * settings and (coach) Hallinta-lite as those land. Presentational.
 */
export function AccountScreen({ email, role, onSignOut }: Props) {
  return (
    <Screen>
      <Header title="Tili" />
      <View style={s.body}>
        <Card>
          <InfoRow label="Sähköposti" value={email ?? "—"} />
          <View style={s.divider} />
          <InfoRow label="Rooli" value={role ? ROLE_LABEL[role] : "—"} />
        </Card>

        <Button
          label="Kirjaudu ulos"
          variant="secondary"
          icon={<LogOut size={16} color={color.primary} strokeWidth={2.2} />}
          onPress={onSignOut}
        />
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text variant="label">{label}</Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  body: { padding: space.lg, gap: space.lg },
  infoRow: { gap: 2, paddingVertical: space.sm },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: color.border },
});
