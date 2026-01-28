/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/agendaList.module.css";

type AgendaDay = {
  id?: string | null;
  date?: string;
  day?: string;
  agenda_date?: string;
  financial_status?: "pendiente" | "parcial" | "pagado" | "franco";
};

type WeekDay = {
  date: string;
  dayOfMonth: number;
  dayName: string;
  dayNameShort: string;
  data: AgendaDay | undefined;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
};

type AgendaListProps = {
  days: AgendaDay[];
};

export default function AgendaList({ days }: AgendaListProps) {
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Empezar el lunes de esta semana
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    const start = new Date(today.getFullYear(), today.getMonth(), diff);
    return start;
  });

  if (!days || days.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <p className={styles.emptyMessage}>No hay días en la agenda.</p>
        </div>
      </div>
    );
  }

  /* =========================
     HELPERS
  ========================= */

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const isPastDay = (date: string) => {
    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate < today;
  };

  const isFutureDay = (date: string) => {
    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate > today;
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "pagado":
        return styles.paid;
      case "parcial":
        return styles.partial;
      case "pendiente":
        return styles.pending;
      case "franco":
        return styles.dayOff;
      default:
        return styles.noData;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "pagado":
        return "PAGADO";
      case "parcial":
        return "PARCIAL";
      case "pendiente":
        return "PENDIENTE";
      case "franco":
        return "FRANCO";
      default:
        return "SIN DATO";
    }
  };

  // 👉 NAVEGACIÓN POR FECHA
  const goToDay = (date: string) => {
    router.push(`/driver/day/${date}`);
  };

  /* =========================
     NAVEGACIÓN SEMANAL
  ========================= */

  const prevWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const nextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const goToTodayWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(today.getFullYear(), today.getMonth(), diff);
    setCurrentWeekStart(start);
  };

  /* =========================
     CONSTRUIR SEMANA
  ========================= */

  const getWeekDays = (): WeekDay[] => {
    const weekDays: WeekDay[] = [];
    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const dayNamesShort = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setDate(currentWeekStart.getDate() + i);

      const dateStr = formatDate(currentDate);
      const dayOfMonth = currentDate.getDate();
      const dayOfWeek = currentDate.getDay();
      const dayName = dayNames[dayOfWeek];
      const dayNameShort = dayNamesShort[dayOfWeek];

      // Buscar datos para este día
      const dayData = days.find((d) => {
        const dDate = d.date || d.day || d.agenda_date;
        return dDate === dateStr;
      });

      const dayDate = new Date(dateStr);
      dayDate.setHours(0, 0, 0, 0);

      const isToday = dateStr === todayStr;
      const isPast = dayDate < today;
      const isFuture = dayDate > today;

      weekDays.push({
        date: dateStr,
        dayOfMonth,
        dayName,
        dayNameShort,
        data: dayData,
        isToday,
        isPast,
        isFuture,
      });
    }

    return weekDays;
  };

  const weekDays = getWeekDays();

  // Formatear rango de fechas para mostrar
  const getWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];

    const startMonth = new Date(start.date).toLocaleDateString("es-AR", {
      month: "short",
    });
    const endMonth = new Date(end.date).toLocaleDateString("es-AR", {
      month: "short",
    });

    if (startMonth === endMonth) {
      return `${start.dayOfMonth} - ${end.dayOfMonth} ${startMonth}`.toUpperCase();
    }
    return `${start.dayOfMonth} ${startMonth} - ${end.dayOfMonth} ${endMonth}`.toUpperCase();
  };

  /* =========================
     ESTADÍSTICAS
  ========================= */

  const getWeekStats = () => {
    const stats = {
      pending: 0,
      partial: 0,
      paid: 0,
      dayOff: 0,
    };

    weekDays.forEach((day) => {
      if (day.data?.financial_status === "pendiente") stats.pending++;
      if (day.data?.financial_status === "parcial") stats.partial++;
      if (day.data?.financial_status === "pagado") stats.paid++;
      if (day.data?.financial_status === "franco") stats.dayOff++;
    });

    return stats;
  };

  const stats = getWeekStats();

  /* =========================
     RENDER
  ========================= */

  return (
    <div className={styles.container}>
      {/* HEADER SEMANAL */}
      <div className={styles.header}>
        <button
          onClick={prevWeek}
          type="button"
          className={styles.navButton}
          aria-label="Semana anterior"
        >
          ◀
        </button>

        <div className={styles.weekInfo}>
          <div className={styles.weekRange}>{getWeekRange()}</div>
          <button
            onClick={goToTodayWeek}
            type="button"
            className={styles.todayButton}
          >
            HOY
          </button>
        </div>

        <button
          onClick={nextWeek}
          type="button"
          className={styles.navButton}
          aria-label="Semana siguiente"
        >
          ▶
        </button>
      </div>

      {/* GRID SEMANAL SIMPLE */}
      <div className={styles.weekGrid}>
        {weekDays.map((day) => {
          const statusClass = getStatusClass(day.data?.financial_status);
          const isClickable = !day.isPast || day.isToday;

          return (
            <div
              key={day.date}
              className={`${styles.daySquare} ${statusClass} ${
                day.isToday ? styles.today : ""
              } ${day.isPast && !day.isToday ? styles.past : ""} ${
                isClickable ? styles.clickable : ""
              }`}
              onClick={() => isClickable && goToDay(day.date)}
              role={isClickable ? "button" : "article"}
              tabIndex={isClickable ? 0 : -1}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  goToDay(day.date);
                }
              }}
              aria-label={`${day.dayName} ${day.dayOfMonth} - ${getStatusText(day.data?.financial_status)}`}
            >
              {/* DÍA Y NÚMERO */}
              <div className={styles.dayTop}>
                <div className={styles.dayName}>{day.dayNameShort}</div>
                <div
                  className={`${styles.dayNumber} ${day.isToday ? styles.todayNumber : ""}`}
                >
                  {day.dayOfMonth}
                </div>
              </div>

              {/* ESTADO */}
              <div className={styles.dayStatus}>
                {getStatusText(day.data?.financial_status)}
              </div>

              {/* INDICADOR HOY */}
              {day.isToday && <div className={styles.todayIndicator}></div>}
            </div>
          );
        })}
      </div>

      {/* CONTADORES */}
      <div className={styles.counters}>
        <div className={styles.counterItem}>
          <div className={styles.counterNumber} style={{ color: "#FF3B30" }}>
            {stats.pending}
          </div>
          <div className={styles.counterLabel}>PENDIENTE</div>
        </div>
        <div className={styles.counterItem}>
          <div className={styles.counterNumber} style={{ color: "#FF9500" }}>
            {stats.partial}
          </div>
          <div className={styles.counterLabel}>PARCIAL</div>
        </div>
        <div className={styles.counterItem}>
          <div className={styles.counterNumber} style={{ color: "#34C759" }}>
            {stats.paid}
          </div>
          <div className={styles.counterLabel}>PAGADO</div>
        </div>
        <div className={styles.counterItem}>
          <div className={styles.counterNumber} style={{ color: "#8E8E93" }}>
            {stats.dayOff}
          </div>
          <div className={styles.counterLabel}>FRANCO</div>
        </div>
      </div>
    </div>
  );
}
