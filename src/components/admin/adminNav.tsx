"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "../../styles/adminNav.module.css";

type Props = {
  adminName?: string | null;
};

export default function AdminNav({ adminName }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const notificationCounts = {
    choferes: 2,
    pagos: 5,
    reportes: 1,
  };

  const menuItems = [
    { id: "home", label: "Home", href: "/admin" },
    { id: "choferes", label: "Choferes", href: "/admin/choferes" },
    { id: "agenda", label: "Agenda", href: "/admin/agenda" },
    { id: "pagos", label: "Pagos", href: "/admin/pagos" },
    { id: "reportes", label: "Reportes", href: "/admin/reportes" },
    {
      id: "configuracion",
      label: "Configuración",
      href: "/admin/configuracion",
    },
  ];

  const handleNavigate = (href: string) => {
    router.push(href);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={styles.adminNav}>
        {/* ========== DESKTOP SIDEBAR ========== */}
        <aside
          className={`${styles.adminNavSidebar} ${
            mobileMenuOpen ? styles.mobileOpen : ""
          }`}
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
                className={`${styles.adminNavItem} ${
                  isActive(item.href) ? styles.active : ""
                }`}
                onClick={() => handleNavigate(item.href)}
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
          className={`${styles.adminNavOverlay} ${styles.mobileOpen}`}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
