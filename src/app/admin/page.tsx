import { supabaseServer } from "@/lib/supabase/server";
import styles from "./adminHome.module.css";

type HomeSummary = {
  drivers_active: number;
  drivers_with_pending_days: number;
  estimated_total_debt: number;
  payments_today: number;
  alerts: {
    past_days_pending: number;
    payments_loaded_today: number;
  };
  last_payments: {
    driver_name: string;
    amount: number;
    date: string;
  }[];
};
export default async function AdminHomePage() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase.rpc("admin_home_summary");

  if (error || !data) {
    return (
      <div className={styles.container}>
        <h2 className={styles.error}>Error cargando el resumen</h2>
      </div>
    );
  }

  const summary = data as HomeSummary;

  const cards = [
    {
      label: "Choferes activos",
      value: summary.drivers_active,
      show: true,
    },
    {
      label: "Choferes con deuda",
      value: summary.drivers_with_pending_days,
      show: summary.drivers_with_pending_days > 0,
    },
    {
      label: "Deuda total",
      value: `$${summary.estimated_total_debt.toLocaleString("es-AR")}`,
      show: summary.estimated_total_debt > 0,
    },
    {
      label: "Pagos hoy",
      value: `$${summary.payments_today.toLocaleString("es-AR")}`,
      show: summary.payments_today > 0,
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel de Administración</h1>

      {/* CARDS */}
      <div className={styles.cardsGrid}>
        {cards
          .filter((c) => c.show)
          .map((card) => (
            <div key={card.label} className={styles.card}>
              <span className={styles.cardLabel}>{card.label}</span>
              <span className={styles.cardValue}>{card.value}</span>
            </div>
          ))}
      </div>

      {/* ALERTAS */}
      {(data.alerts.past_days_pending > 0 ||
        data.alerts.payments_loaded_today > 0) && (
        <div className={styles.alerts}>
          <h2 className={styles.alertsTitle}>Alertas</h2>

          <ul className={styles.alertsList}>
            {data.alerts.past_days_pending > 0 && (
              <li>{data.alerts.past_days_pending} días pasados pendientes</li>
            )}
            {data.alerts.payments_loaded_today > 0 && (
              <li>{data.alerts.payments_loaded_today} pagos cargados hoy</li>
            )}
          </ul>
        </div>
      )}

      {/* ÚLTIMOS PAGOS */}
      {summary.last_payments.length > 0 && (
        <div className={styles.lastPayments}>
          <h2 className={styles.sectionTitle}>Últimos pagos</h2>

          <ul className={styles.lastPaymentsList}>
            {summary.last_payments.map((payment, index) => (
              <li key={index} className={styles.lastPaymentItem}>
                <span className={styles.paymentDriver}>
                  {payment.driver_name}
                </span>

                <span className={styles.paymentDate}>
                  {new Date(payment.date).toLocaleDateString("es-AR")}
                </span>

                <span className={styles.paymentAmount}>
                  ${payment.amount.toLocaleString("es-AR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
