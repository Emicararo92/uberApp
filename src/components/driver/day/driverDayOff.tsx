"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase/client";
import styles from "./dayOffToggle.module.css";

type Props = {
  date: string;
  isDayOff: boolean;
};

export default function DayOffToggle({ date, isDayOff }: Props) {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [existingDayOff, setExistingDayOff] = useState<string | null>(null);

  const callSetDayOff = async () => {
    const { error } = await supabase.rpc("set_driver_day_off", {
      p_date: date,
    });

    if (error) {
      alert(error.message);
      console.error(error);
    } else {
      router.refresh();
    }
  };

  const handleToggle = async () => {
    setLoading(true);

    // Si ya es franco, se quita directo
    if (isDayOff) {
      await callSetDayOff();
      setLoading(false);
      return;
    }

    // Buscar si ya hay un franco esa semana
    const { data, error } = await supabase.rpc("get_driver_week_day_off", {
      p_date: date,
    });

    if (error) {
      alert(error.message);
      console.error(error);
      setLoading(false);
      return;
    }

    // Si no hay ninguno → marcar directo
    if (!data || data.length === 0) {
      await callSetDayOff();
      setLoading(false);
      return;
    }

    const dayOffDate = data[0]?.day_off_date;

    // Si el franco ya es este día (caso raro pero seguro)
    if (dayOffDate === date) {
      await callSetDayOff();
      setLoading(false);
      return;
    }

    // Hay otro franco → pedir confirmación
    setExistingDayOff(dayOffDate);
    setShowConfirm(true);
    setLoading(false);
  };

  const confirmMove = async () => {
    setShowConfirm(false);
    setLoading(true);
    await callSetDayOff();
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      {isDayOff ? (
        <>
          <div className={styles.dayOffBadge}>☕ Este día es tu franco</div>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={styles.removeBtn}
          >
            {loading ? "Actualizando..." : "Quitar franco"}
          </button>
        </>
      ) : (
        <button
          onClick={handleToggle}
          disabled={loading}
          className={styles.setBtn}
        >
          {loading ? "Marcando..." : "🛑 Marcar como franco"}
        </button>
      )}

      {/* MODAL CONFIRMACIÓN */}
      {showConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>Mover franco</h3>

            <p className={styles.modalText}>
              Ya tenés un franco el día{" "}
              <strong>
                {new Date(existingDayOff!).toLocaleDateString("es-AR")}
              </strong>
              .<br />
              ¿Querés moverlo a este día?
            </p>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                className={styles.confirmBtn}
                onClick={confirmMove}
                disabled={loading}
              >
                {loading ? "Moviendo..." : "Mover franco"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
