/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "../../styles/driverNav.module.css";

type MenuItem = "inicio" | "historial" | "perfil";

const MENU_ITEMS: Array<{ id: MenuItem; label: string; path: string }> = [
  { id: "inicio", label: "Inicio", path: "/driver" },
  { id: "historial", label: "Historial", path: "/driver/historial " },
  { id: "perfil", label: "Perfil", path: "/driver/profile" },
];

type Props = {
  driverName?: string | null;
};

export default function DriverNav({ driverName }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<MenuItem>("inicio");
  const [isMobile, setIsMobile] = useState(false);

  const displayName = driverName ?? "Conductor";

  // 👉 ACTIVO SEGÚN URL (FIX)
  useEffect(() => {
    if (pathname.startsWith("/driver/history")) {
      setActiveItem("historial");
      return;
    }

    if (pathname.startsWith("/driver/profile")) {
      setActiveItem("perfil");
      return;
    }

    if (pathname === "/driver") {
      setActiveItem("inicio");
      return;
    }
  }, [pathname]);

  // Detectar mobile
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
      const found = MENU_ITEMS.find((i) => i.id === item);
      if (!found) return;

      setActiveItem(item);
      router.push(found.path);

      if (isMobile) {
        setMobileMenuOpen(false);
      }
    },
    [isMobile, router],
  );

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <nav className={styles.driverNav} aria-label="Navegación principal">
        {/* SIDEBAR DESKTOP */}
        <aside className={styles.driverNavSidebar}>
          <div className={styles.driverNavBrand}>
            <h1 className={styles.driverNavTitle}>Gestión de Flotas</h1>
            <span className={styles.driverNavName}>{displayName}</span>
          </div>

          <ul className={styles.driverNavMenu}>
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.driverNavItem} ${
                    activeItem === item.id ? styles.active : ""
                  }`}
                  onClick={() => handleItemClick(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* TOPBAR MOBILE */}
        <header className={styles.driverNavTopbar}>
          <h2 className={styles.driverNavTopTitle}>Gestión de Flotas</h2>

          <button
            className={styles.menuToggle}
            onClick={toggleMobileMenu}
            type="button"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* SIDEBAR MOBILE */}
        <aside
          className={`${styles.driverNavSidebarMobile} ${
            mobileMenuOpen ? styles.mobileOpen : ""
          }`}
        >
          <ul className={styles.driverNavMenu}>
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.driverNavItem} ${
                    activeItem === item.id ? styles.active : ""
                  }`}
                  onClick={() => handleItemClick(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {mobileMenuOpen && (
          <div className={styles.navOverlay} onClick={closeMobileMenu} />
        )}
      </nav>
    </>
  );
}
