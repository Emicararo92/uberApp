import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import DriverApp from "../../components/driver/driverApp";
import DriverAgenda from "../../components/driver/driverAgenda";

export default async function DriverPage() {
  const supabase = await supabaseServer();

  // 1. Sesión
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // 2. Profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", authData.user.id)
    .single();

  if (error || !profile) redirect("/login");

  // 3. Seguridad por rol
  if (profile.role !== "driver") {
    redirect("/");
  }

  // 4. Render de la app del chofer
  return (
    <DriverApp user={authData.user} profile={profile}>
      <DriverAgenda />
    </DriverApp>
  );
}
