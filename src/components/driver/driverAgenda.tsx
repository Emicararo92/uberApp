
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import { getAgendaWithStatus } from "../../../lib/data/agenda";
import AgendaList from "../agenda/agendaList";
import styles from "../../styles/driverAgenda.module.css";
import ErrorDisplay from "../driver/ErrorDisplay";
import RefreshButton from "../driver/RefreshButton";

type AgendaDay = {
  id: string;
  date: string;
  base_amount: number;
  is_day_off: boolean;
  total_paid: number;
  financial_status: "pendiente" | "parcial" | "pagado" | "franco";
  day_debt: number;
};

type ProfileData = {
  id: string;
  role: string;
  full_name: string;
};

export default async function DriverAgenda() {
  const supabase = await supabaseServer();

  // 1. Sesión
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) redirect("/login");

  // 2. Profile
  let profile: ProfileData | null = null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", authData.user.id)
      .single();

    if (error) throw error;
    profile = data;
  } catch {
    return (
      <ErrorDisplay
        type="profile"
        message="No se pudo cargar la información de tu perfil."
      />
    );
  }

  if (!profile || profile.role !== "driver") redirect("/");

  // 3. Agenda financiera real
  let agenda: AgendaDay[] = [];
  try {
    const agendaData = await getAgendaWithStatus();
    agenda = agendaData;
  } catch {
    return (
      <ErrorDisplay type="agenda" message="No se pudo cargar la agenda." />
    );
  }

  if (agenda.length === 0) {
    return (
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Agenda</h1>
          <div className={styles.profileInfo}>
            <span className={styles.driverName}>{profile.full_name}</span>
            <span className={styles.driverRole}>Chofer</span>
          </div>
        </header>

        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2 className={styles.emptyTitle}>Agenda vacía</h2>
          <p className={styles.emptyMessage}>No hay días generados.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Agenda</h1>
          <div className={styles.profileInfo}>
            <span className={styles.driverName}>{profile.full_name}</span>
            <span className={styles.driverRole}>Chofer</span>
          </div>
        </div>
      </header>

      <section className={styles.agendaSection}>
        <AgendaList days={agenda} />
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Actualizado al {new Date().toLocaleDateString("es-AR")}
        </p>
        <RefreshButton />
      </footer>
    </main>
  );
}
