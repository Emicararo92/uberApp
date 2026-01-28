/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useState, useTransition, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import styles from "../../../styles/dayPayments.module.css";

type PaymentRow = {
  amount_applied: number;
  payments: {
    id: string;
    amount: number;
    method: string;
    note: string | null;
    created_at: string;
  };
};

type Payment = {
  id: string;
  amount: number;
  method: string;
  note: string | null;
  created_at: string;
  amount_applied: number;
};

type Props = {
  agendaDayId: string;
  driverId: string;
  baseAmount: number;
};

export default function DayPayments({
  agendaDayId,
  driverId,
  baseAmount,
}: Props) {
  const supabase = supabaseBrowser();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Efectivo");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const remaining = baseAmount - totalPaid;

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_day_links")
        .select(
          `
          amount_applied,
          payments (
            id,
            amount,
            method,
            note,
            created_at
          )
        `,
        )
        .eq("agenda_day_id", agendaDayId)
        .order("created_at", { ascending: false });

      if (error || !data) return;

      const mapped: Payment[] = (data as unknown as PaymentRow[]).map(
        (row) => ({
          id: row.payments.id,
          amount: row.payments.amount,
          method: row.payments.method,
          note: row.payments.note,
          created_at: row.payments.created_at,
          amount_applied: Number(row.amount_applied),
        }),
      );

      const total = mapped.reduce((acc, p) => acc + p.amount_applied, 0);

      setPayments(mapped);
      setTotalPaid(total);
    } finally {
      setIsLoading(false);
    }
  }, [agendaDayId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = Number(amount);

    if (!value || value <= 0) {
      setError("Monto inválido");
      return;
    }

    if (value > remaining) {
      setError(`No puede superar el restante ($${remaining})`);
      return;
    }

    startTransition(async () => {
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          driver_id: driverId,
          amount: value,
          method,
          note: note || null,
        })
        .select()
        .single();

      if (paymentError || !payment) {
        setError("Error creando el pago");
        return;
      }

      const { error: linkError } = await supabase
        .from("payment_day_links")
        .insert({
          payment_id: payment.id,
          agenda_day_id: agendaDayId,
          amount_applied: value,
        });

      if (linkError) {
        setError(linkError.message);
        return;
      }

      setAmount("");
      setNote("");
      await loadPayments();
    });
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR").format(value);

  return (
    <section className={styles.paymentsSection}>
      {/* HEADER */}
      <div className={styles.paymentsHeader}>
        <div>
          <h2 className={styles.paymentsTitle}>Pagos</h2>
          <p className={styles.paymentsSubtitle}>Movimientos del día</p>
        </div>

        <button
          type="button"
          onClick={loadPayments}
          disabled={isLoading}
          className={styles.loadPaymentsBtn}
        >
          {isLoading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {/* RESUMEN */}
      <div className={styles.paymentsSummary}>
        <div className={`${styles.summaryItem} ${styles.remainingBox}`}>
          <span className={styles.summaryLabel}>Restante</span>
          <span className={styles.remainingValue}>
            ${formatCurrency(remaining)}
          </span>
        </div>

        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total pagado</span>
          <span className={styles.totalPaidValue}>
            ${formatCurrency(totalPaid)}
          </span>
        </div>
      </div>

      {/* LISTA */}
      {payments.length === 0 ? (
        <div className={styles.emptyPayments}>
          <div className={styles.emptyIcon}>💸</div>
          <p className={styles.emptyMessage}>Todavía no hay pagos</p>
        </div>
      ) : (
        <div className={styles.paymentsList}>
          {payments.map((payment) => (
            <div key={payment.id} className={styles.paymentItem}>
              <div className={styles.paymentTop}>
                <span className={styles.paymentAmount}>
                  ${formatCurrency(payment.amount_applied)}
                </span>

                <span
                  className={`${styles.paymentMethod} ${styles[payment.method]}`}
                >
                  {payment.method === "Efectivo"
                    ? "Efectivo"
                    : payment.method === "Transferencia"
                      ? "Transferencia"
                      : "Otro"}
                </span>
              </div>

              {payment.note && (
                <div className={styles.paymentNote}>{payment.note}</div>
              )}

              <div className={styles.paymentDate}>
                {formatDate(payment.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM */}
      {remaining > 0 && (
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
          <h3 className={styles.paymentFormTitle}>Nuevo pago</h3>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Monto</label>
            <input
              type="number"
              placeholder="Ej: 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.formInput}
              required
              min="1"
              max={remaining}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Método</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={styles.formSelect}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Nota</label>
            <input
              type="text"
              placeholder="Opcional"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.formInput}
              maxLength={100}
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            type="submit"
            disabled={isPending || !amount}
            className={styles.submitBtn}
          >
            {isPending ? "Guardando…" : "Guardar pago"}
          </button>
        </form>
      )}

      {remaining <= 0 && payments.length > 0 && (
        <div className={styles.fullyPaid}>Día completamente pagado</div>
      )}
    </section>
  );
}
