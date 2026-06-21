import { useAuth } from "@/hooks/useAuth";
import { AccountScreen } from "@/features/account/AccountScreen";

export default function CoachAccountScreen() {
  const { user, role, signOut } = useAuth();
  return <AccountScreen email={user?.email ?? null} role={role} onSignOut={() => signOut()} />;
}
