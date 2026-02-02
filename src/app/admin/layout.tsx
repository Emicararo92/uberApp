export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminNav from "../../components/admin/adminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.app_metadata?.role !== "admin") {
    redirect("/driver");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminNav adminName={user.email} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
