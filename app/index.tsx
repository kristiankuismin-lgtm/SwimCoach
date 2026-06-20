import { View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { PaceClock } from "@/components/ui/PaceClock";
import { color } from "@/constants/theme";

/**
 * Entry route for `/`. Without it, the root URL matches no screen and Expo Router
 * shows the file-picker sitemap. This lands every visit (and every browser reload)
 * on the right place for the signed-in role.
 */
export default function Index() {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <PaceClock size={48} />
      </View>
    );
  }
  if (!session) return <Redirect href="/auth/login" />;

  const isCoach = role === "coach" || role === "club_admin";
  return <Redirect href={isCoach ? "/coach" : "/swimmer"} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.bg },
});
