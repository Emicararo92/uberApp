"use client";

import { useState } from "react";
import styles from "../../styles/adminNav.module.css";

type Props = {
  adminName?: string | null;
};

export default function AdminNav({ adminName }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("choferes");

  // Datos de ejemplo para badges de notificaciones
  const notificationCounts = {
    choferes: 2,
    pagos: 5,
    reportes: 1,
  };

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const menuItems = [
    { id: "choferes", label: "Choferes" },
    { id: "agenda", label: "Agenda" },
    { id: "pagos", label: "Pagos" },
    { id: "reportes", label: "Reportes" },
    { id: "configuracion", label: "Configuración" },
  ];

  return (
    <>
      <nav className={styles.adminNav}>
        {/* ========== DESKTOP SIDEBAR ========== */}
        <aside
          className={`${styles.adminNavSidebar} ${mobileMenuOpen ? styles.mobileOpen : ""}`}
        >
          <div className={styles.adminNavBrand}>
            <strong>Panel Admin</strong>
            {adminName && (
              <span className={styles.adminNavName}>{adminName}</span>
            )}
          </div>

          <ul className={styles.adminNavMenu}>
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={`${styles.adminNavItem} ${activeItem === item.id ? styles.active : ""}`}
                onClick={() => handleItemClick(item.id)}
              >
                {item.label}
                {notificationCounts[
                  item.id as keyof typeof notificationCounts
                ] > 0 && (
                  <span className={styles.adminNavItemBadge}>
                    {
                      notificationCounts[
                        item.id as keyof typeof notificationCounts
                      ]
                    }
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Footer opcional */}
          <div className={styles.adminNavFooter}>Versión 1.0.0</div>
        </aside>

        {/* ========== MOBILE TOPBAR ========== */}
        <header className={styles.adminNavTopbar}>
          <div className={styles.adminNavTopLeft}>
            <strong>Panel Admin</strong>
          </div>

          <div
            className={styles.adminNavTopRight}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            role="button"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            tabIndex={0}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </div>
        </header>
      </nav>

      {/* Overlay para móvil */}
      {mobileMenuOpen && (
        <div
          className={`${styles.adminNavOverlay} ${mobileMenuOpen ? styles.mobileOpen : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
