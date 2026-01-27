"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "../../styles/driverNav.module.css";

type MenuItem = "inicio" | "agenda" | "historial" | "perfil";

const MENU_ITEMS: Array<{ id: MenuItem; label: string }> = [
  { id: "inicio", label: "Inicio" },
  { id: "agenda", label: "Agenda" },
  { id: "historial", label: "Historial" },
  { id: "perfil", label: "Perfil" },
];

type Props = {
  driverName?: string | null;
};

export default function DriverNav({ driverName }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<MenuItem>("inicio");
  const [isMobile, setIsMobile] = useState(false);

  // Valor por defecto que maneja null
  const displayName = driverName ?? "Conductor";

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleItemClick = useCallback(
    (item: MenuItem) => {
      setActiveItem(item);
      if (isMobile) {
        setMobileMenuOpen(false);
      }
    },
    [isMobile],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, item: MenuItem) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleItemClick(item);
      }
    },
    [handleItemClick],
  );

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Cerrar menú al presionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen, closeMobileMenu]);

  return (
    <>
      <nav className={styles.driverNav} aria-label="Navegación principal">
        {/* ========== SIDEBAR DESKTOP (SIEMPRE VISIBLE) ========== */}
        <aside className={styles.driverNavSidebar} aria-label="Menú lateral">
          <div className={styles.driverNavBrand}>
            <h1 className={styles.driverNavTitle}>Gestión de Flotas</h1>
            <span className={styles.driverNavName} title={displayName}>
              {displayName}
            </span>
          </div>

          <ul className={styles.driverNavMenu} role="menubar">
            {MENU_ITEMS.map((item) => (
              <li key={item.id} role="none">
                <button
                  className={`${styles.driverNavItem} ${
                    activeItem === item.id ? styles.active : ""
                  }`}
                  onClick={() => handleItemClick(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  role="menuitem"
                  aria-current={activeItem === item.id ? "page" : undefined}
                  tabIndex={0}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ========== TOPBAR MOBILE ========== */}
        <header className={styles.driverNavTopbar}>
          <div>
            <h2 className={styles.driverNavTopTitle}>Gestión de Flotas</h2>
          </div>

          <button
            className={styles.menuToggle}
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-sidebar"
            type="button"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* ========== SIDEBAR MOBILE (DRAWER) ========== */}
        <aside
          id="mobile-sidebar"
          className={`${styles.driverNavSidebarMobile} ${
            mobileMenuOpen ? styles.mobileOpen : ""
          }`}
          aria-label="Menú móvil"
          aria-hidden={!mobileMenuOpen}
        >
          <div className={styles.driverNavBrand}>
            <h2 className={styles.driverNavTitle}>Menú</h2>
            <span className={styles.driverNavName}>{displayName}</span>
          </div>

          <ul className={styles.driverNavMenu} role="menubar">
            {MENU_ITEMS.map((item) => (
              <li key={item.id} role="none">
                <button
                  className={`${styles.driverNavItem} ${
                    activeItem === item.id ? styles.active : ""
                  }`}
                  onClick={() => handleItemClick(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  role="menuitem"
                  aria-current={activeItem === item.id ? "page" : undefined}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ========== OVERLAY MOBILE ========== */}
        {mobileMenuOpen && (
          <div
            className={styles.navOverlay}
            onClick={closeMobileMenu}
            onKeyDown={(e) => e.key === "Escape" && closeMobileMenu()}
            role="button"
            aria-label="Cerrar menú"
            tabIndex={0}
          />
        )}
      </nav>

      {/* ========== CONTENIDO PRINCIPAL (PARA ESPACIADO) ========== */}
      <style jsx global>{`
        /* Ajustar contenido principal cuando sidebar está abierta */
        @media (min-width: 900px) {
          main,
          .main-content {
            margin-left: 260px;
          }
        }

        /* Ajustar para topbar móvil */
        @media (max-width: 899px) {
          main,
          .main-content {
            margin-top: 64px;
          }
        }
      `}</style>
    </>
  );
}
