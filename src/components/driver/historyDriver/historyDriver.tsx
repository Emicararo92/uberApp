/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../../lib/supabase/client";
import styles from "./history.module.css";

type PaymentHistoryItem = {
  payment_day_link_id: string;

  payment_id: string;
  payment_total_amount: number;
  payment_method: string;
  payment_note: string | null;
  payment_created_at: string;

  amount_applied: number;

  agenda_day_id: string;
  agenda_date: string;
  day_base_amount: number;
  is_day_off: boolean;
  day_note: string | null;
};

export default function HistoryPage() {
  const supabase = supabaseBrowser();

  const [items, setItems] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const loadHistory = async () => {
    setLoading(true);

    const { data: test, error: testError } = await supabase
      .from("payment_history_view")
      .select("*")
      .limit(5);

    console.log("TEST VIEW:", test, testError);

    const { data, error } = await supabase.rpc("get_payment_history", {
      from_date: fromDate || null,
      to_date: toDate || null,
    });

    console.log("RPC:", data, error);

    if (!error && data) {
      setItems(data);
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Historial de pagos</h1>

      <div className={styles.filters}>
        <div className={styles.inputGroup}>
          <label>Desde</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Hasta</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button onClick={loadHistory} className={styles.filterBtn}>
          Filtrar
        </button>
      </div>

      {loading && <p className={styles.loading}>Ingrese las fechas</p>}

      {!loading && items.length === 0 && (
        <div className={styles.empty}>
          <p>No hay pagos registrados.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.payment_day_link_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.date}>
                  {new Date(item.agenda_date).toLocaleDateString()}
                </span>

                {item.is_day_off && (
                  <span className={styles.dayOff}>Franco</span>
                )}
              </div>

              <div className={styles.amount}>
                ${item.amount_applied.toLocaleString()}
              </div>

              <div className={styles.meta}>
                <span>
                  Pago{" "}
                  {new Date(item.payment_created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>{item.payment_method}</span>
              </div>

              {(item.payment_note || item.day_note) && (
                <p className={styles.note}>
                  {item.payment_note || item.day_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
