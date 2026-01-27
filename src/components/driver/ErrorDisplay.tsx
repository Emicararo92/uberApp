import styles from "../../styles/driverAgenda.module.css";

type ErrorDisplayProps = {
  type: "profile" | "agenda";
  message: string;
};

export default function ErrorDisplay({ type, message }: ErrorDisplayProps) {
  const icon = type === "profile" ? "⚠️" : "📅";
  const title = type === "profile" ? "Error de perfil" : "Error de agenda";

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <div className={styles.errorIcon}>{icon}</div>
        <h2 className={styles.errorTitle}>{title}</h2>
        <p className={styles.errorMessage}>{message}</p>
        <p className={styles.errorNote}>
          Por favor, contacta al administrador o intenta más tarde.
        </p>
      </div>
    </div>
  );
}
