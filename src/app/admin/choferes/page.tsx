import { supabaseServer } from "@/lib/supabase/server";
import styles from "./adminDrivers.module.css";
import Link from "next/link";

type DriverRow = {
  driver_id: string;
  display_name: string;
  active: boolean;
  pending_days_count: number;
  estimated_debt: number;
};

export default async function AdminDriversPage() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase.rpc("admin_list_drivers");

  if (error || !data) {
    return (
      <div className={styles.container}>
        <h2 className={styles.error}>Error cargando choferes</h2>
      </div>
    );
  }

  const drivers = data as DriverRow[];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Choferes</h1>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Chofer</th>
              <th>Días pendientes</th>
              <th>Deuda</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.driver_id}>
                <td className={styles.driverName}>{driver.display_name}</td>

                <td>{driver.pending_days_count}</td>

                <td className={styles.debt}>
                  ${driver.estimated_debt.toLocaleString("es-AR")}
                </td>

                <td>
                  <Link
                    href={`/admin/choferes/${driver.driver_id}`}
                    className={styles.link}
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}

            {drivers.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  No hay choferes activos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
