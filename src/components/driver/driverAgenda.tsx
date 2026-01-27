/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabase/server";
import { getAgendaWithStatus } from "../../../lib/data/agenda";
import AgendaList from "../agenda/agendaList";
import styles from "../../styles/driverAgenda.module.css";
import ErrorDisplay from "../driver/ErrorDisplay";
import RefreshButton from "../driver/RefreshButton";

// Definir tipos
type AgendaDay = {
  id: string;
  date: string;
  status: "pending" | "completed" | "cancelled" | "in_progress";
  vehicle: string;
  route: string;
  driver_id?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
};

type ProfileData = {
  id: string;
  role: string;
  full_name: string;
};

// Componente para estadísticas
function AgendaStats({ agenda }: { agenda: AgendaDay[] }) {
  const stats = {
    pending: agenda.filter((item) => item.status === "pending").length,
    completed: agenda.filter((item) => item.status === "completed").length,
    inProgress: agenda.filter((item) => item.status === "in_progress").length,
    cancelled: agenda.filter((item) => item.status === "cancelled").length,
    total: agenda.length,
  };
}

// Componente principal
export default async function DriverAgenda() {
  const supabase = await supabaseServer();

  // 1. Verificar sesión - manejo seguro de null
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("Error de autenticación:", authError);
    redirect("/login");
  }

  if (!authData?.user) {
    redirect("/login");
  }

  // 2. Obtener perfil
  let profile: ProfileData | null = null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", authData.user.id)
      .single();

    if (error) throw error;
    profile = data;
  } catch (error) {
    return (
      <ErrorDisplay
        type="profile"
        message="No se pudo cargar la información de tu perfil."
      />
    );
  }

  // 3. Validar rol de conductor
  if (!profile || profile.role !== "driver") {
    redirect("/");
  }

  // 4. Obtener agenda
  let agenda: AgendaDay[] = [];
  try {
    const agendaData = await getAgendaWithStatus();

    // Transformar datos de forma segura
    agenda = agendaData
      .map((day: any) => ({
        id: day.id || `day-${Date.now()}-${Math.random()}`,
        date: day.date || new Date().toISOString().split("T")[0],
        status: day.status || "pending",
        vehicle: day.vehicle || "Sin asignar",
        route: day.route || "Ruta no definida",
        driver_id: day.driver_id,
        start_time: day.start_time,
        end_time: day.end_time,
        notes: day.notes,
      }))
      .slice(0, 20);
  } catch (error) {
    console.error("Error cargando agenda:", error);
    return (
      <ErrorDisplay
        type="agenda"
        message="No se pudo cargar la agenda. Por favor, intenta nuevamente."
      />
    );
  }

  // 5. Estado vacío
  if (agenda.length === 0) {
    return (
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Agenda</h1>
          <div className={styles.profileInfo}>
            <span className={styles.driverName}>{profile.full_name}</span>
            <span className={styles.driverRole}>Conductor</span>
          </div>
        </header>

        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2 className={styles.emptyTitle}>Agenda vacía</h2>
          <p className={styles.emptyMessage}>
            No hay viajes programados para mostrar.
          </p>
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
            <span className={styles.driverRole}>Conductor</span>
          </div>
        </div>
      </header>

      <section className={styles.agendaSection}>
        <AgendaList days={agenda} />
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Actualizado al {new Date().toLocaleDateString("es-ES")}
        </p>
        {/* Este será un Client Component separado */}
        <RefreshButton />
      </footer>
    </main>
  );
}
