"use client";

import { useRouter } from "next/navigation";
import styles from "../../styles/driverAgenda.module.css";

export default function RefreshButton() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <button
      className={styles.refreshButton}
      onClick={handleRefresh}
      aria-label="Actualizar agenda"
    >
      🔄 Actualizar
    </button>
  );
}
