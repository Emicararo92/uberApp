import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import DayPayments from "../../../../components/driver/day/dayPayments";
import styles from "../../../../styles/dayId.module.css";
import DayOffToggle from "../../../../components/driver/day/driverDayOff";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type FinancialStatus = "pendiente" | "parcial" | "pagado" | "franco";

export default async function DriverDayPage({ params }: Props) {
  const { id } = await params;

  // 🔥 normalizar fecha
  const onlyDate = id.includes("T") ? id.split("T")[0] : id;

  // 🔥 fecha segura
  const parsedDate = new Date(`${onlyDate}T00:00:00`);

  const prevDate = new Date(parsedDate);
  prevDate.setDate(prevDate.getDate() - 1);

  const nextDate = new Date(parsedDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const formatUrlDate = (d: Date) => d.toISOString().split("T")[0];

  const supabase = await supabaseServer();

  // 1. Sesión
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // 2. Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) redirect("/login");
  if (profile.role !== "driver") redirect("/");

  // 3. Driver real
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (driverError || !driver) {
    return <main className={styles.dayPage}>Chofer no encontrado</main>;
  }

  // 4. Buscar día real
  const { data: day } = await supabase
    .from("agenda_days")
    .select(
      `
      id,
      date,
      base_amount,
      is_day_off,
      day_note,
      payment_day_links(amount_applied)
    `,
    )
    .eq("driver_id", driver.id)
    .eq("date", onlyDate)
    .maybeSingle();

  const totalPaid =
    day?.payment_day_links?.reduce(
      (acc: number, p: { amount_applied: number }) =>
        acc + Number(p.amount_applied),
      0,
    ) ?? 0;

  const baseAmount = Number(day?.base_amount ?? 0);
  const dayDebt = baseAmount - totalPaid;

  let financialStatus: FinancialStatus = "pendiente";

  if (day?.is_day_off) financialStatus = "franco";
  else if (baseAmount === 0) financialStatus = "pagado";
  else if (totalPaid === 0) financialStatus = "pendiente";
  else if (totalPaid > 0 && dayDebt > 0) financialStatus = "parcial";
  else if (dayDebt <= 0) financialStatus = "pagado";

  const resolvedDay = day
    ? {
        ...day,
        total_paid: totalPaid,
        day_debt: dayDebt,
        financial_status: financialStatus,
      }
    : {
        date: onlyDate,
        base_amount: 0,
        is_day_off: false,
        day_note: null,
        total_paid: 0,
        day_debt: 0,
        financial_status: "pagado" as FinancialStatus,
      };

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("es-AR").format(value);

  const shouldHighlight = resolvedDay.day_debt > 0;

  return (
    <main className={styles.dayPage}>
      {/* 🔁 NAVEGACIÓN DE DÍAS */}
      <header className={styles.dayHeader}>
        <div className={styles.dayNav}>
          <Link
            href={`/driver/day/${formatUrlDate(prevDate)}`}
            className={styles.dayNavBtn}
          >
            ← Anterior
          </Link>

          <p className={styles.daySubtitle}>{profile.full_name} — chofer</p>

          <Link
            href={`/driver/day/${formatUrlDate(nextDate)}`}
            className={styles.dayNavBtn}
          >
            Siguiente →
          </Link>
        </div>
      </header>

      <section className={styles.dayMainInfo}>
        <div className={styles.dayDate}>
          {parsedDate.toLocaleDateString("es-AR", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })}
        </div>

        <div className={styles.dayStatus}>
          <span className={styles.label}>Estado</span>
          <span
            className={styles.value}
            data-status={resolvedDay.financial_status}
          >
            {resolvedDay.financial_status}
          </span>
        </div>
      </section>

      {/* RESTO IGUAL */}

      <section className={styles.dayBlock}>
        <h2 className={styles.dayBlockTitle}>Estado del día</h2>

        <div className={styles.dayRow}>
          <span>Franco</span>
          <strong>{resolvedDay.is_day_off ? "Sí" : "No"}</strong>
        </div>

        <DayOffToggle date={onlyDate} isDayOff={resolvedDay.is_day_off} />
      </section>

      <section className={styles.dayBlock}>
        <h2 className={styles.dayBlockTitle}>Finanzas</h2>

        <div className={styles.dayRow}>
          <span>Monto base</span>
          <strong>${formatNumber(resolvedDay.base_amount)}</strong>
        </div>

        <div className={styles.dayRow}>
          <span>Total pagado</span>
          <strong>${formatNumber(resolvedDay.total_paid)}</strong>
        </div>

        <div className={styles.dayRow} data-highlight={shouldHighlight}>
          <span>Deuda del día</span>
          <strong>${formatNumber(resolvedDay.day_debt)}</strong>
        </div>
      </section>

      {day?.id && (
        <section className={styles.dayBlock}>
          <DayPayments
            agendaDayId={day.id}
            driverId={driver.id}
            baseAmount={baseAmount}
          />
        </section>
      )}

      {resolvedDay.day_note && (
        <section className={styles.dayBlock}>
          <h2 className={styles.dayBlockTitle}>Notas</h2>
          <div className={styles.dayRow}>
            <span>{resolvedDay.day_note}</span>
          </div>
        </section>
      )}
    </main>
  );
}
