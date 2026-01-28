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

  const handleToggle = async () => {
    setLoading(true);

    const { error } = await supabase.rpc("set_driver_day_off", {
      p_date: date,
    });

    if (error) {
      alert(error.message);
      console.error(error);
    } else {
      router.refresh(); // vuelve a pedir el día al server
    }

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
    </div>
  );
}
