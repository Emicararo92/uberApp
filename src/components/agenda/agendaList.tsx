/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../styles/agendaList.module.css";

type AgendaDay = {
  id?: string | null;
  date?: string;
  day?: string;
  agenda_date?: string;
  financial_status?: "pendiente" | "parcial" | "pagado" | "franco";
};

type CalendarDay = {
  date: string;
  data: AgendaDay | undefined;
  number: number;
};

type AgendaListProps = {
  days: AgendaDay[];
};

export default function AgendaList({ days }: AgendaListProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const todayStr = new Date().toISOString().split("T")[0];

  const isToday = (date: string) => date === todayStr;
  const isPastDay = (date: string) => date < todayStr;

  const isOwedDay = (day?: AgendaDay) => {
    if (!day || !day.financial_status) return true; // 👉 día no creado = NO PAGADO
    return (
      day.financial_status === "pendiente" || day.financial_status === "parcial"
    );
  };

  // 👉 NAVEGACIÓN SIEMPRE POR FECHA
  const goToDay = (date: string) => {
    router.push(`/driver/day/${date}`);
  };

  /* =========================
     NAV CALENDAR
  ========================= */

  const prevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const nextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  /* =========================
     BUILD MONTH
  ========================= */

  const getCalendarDays = (): (CalendarDay | null)[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendarDays: (CalendarDay | null)[] = [];

    for (let i = 0; i < startingDay; i++) calendarDays.push(null);

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

      const dayData = days.find((d) => {
        const dDate = d.date || d.day || d.agenda_date;
        return dDate === dateStr;
      });

      calendarDays.push({
        date: dateStr,
        data: dayData,
        number: i,
      });
    }

    return calendarDays;
  };

  const calendarDays = getCalendarDays();

  const monthName = currentDate.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const owedDays = 0;

  /* =========================
     RENDER
  ========================= */

  return (
    <div className={styles.container}>
      {/* Toggle vista */}
      <div className={styles.viewToggle}>
        <button
          onClick={() => setViewMode("calendar")}
          type="button"
          aria-pressed={viewMode === "calendar"}
        >
          Calendario
        </button>
      </div>

      {viewMode === "calendar" ? (
        <div className={styles.calendarView}>
          <div className={styles.calendarHeader}>
            <button onClick={prevMonth} type="button">
              ◀
            </button>

            <div className={styles.monthBlock}>
              <strong>
                {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
              </strong>
              <button
                className={styles.todayButton}
                onClick={goToToday}
                type="button"
              >
                Hoy
              </button>
            </div>

            <button onClick={nextMonth} type="button">
              ▶
            </button>
          </div>

          <div className={styles.daysGrid}>
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
              <div key={d} className={styles.dayHeader}>
                {d}
              </div>
            ))}

            {calendarDays.map((calendarDay, index) => {
              if (!calendarDay)
                return (
                  <div
                    key={`e-${index}`}
                    className={`${styles.dayCell} ${styles.empty}`}
                  />
                );

              const { date, data, number } = calendarDay;
              const today = isToday(date);
              const owed = isOwedDay(data);
              const past = isPastDay(date);

              if (past) {
                return (
                  <div
                    key={date}
                    className={`${styles.dayCell} ${styles.empty}`}
                  />
                );
              }

              return (
                <div
                  key={date}
                  className={`${styles.dayCell} ${styles.clickable} ${
                    today ? styles.today : ""
                  } ${owed ? styles.owedDay : ""}`}
                  onClick={() => goToDay(date)}
                  role="button"
                  tabIndex={0}
                >
                  <span>{number}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <ul>
          {days.map((day, i) => {
            const raw = day.date || day.day || day.agenda_date || "";
            const today = isToday(raw);
            const owed = isOwedDay(day);

            return (
              <li
                key={day.id ?? `day-${i}`}
                onClick={() => goToDay(raw)}
                role="button"
                tabIndex={0}
              >
                <span>
                  {raw}
                  {today && " (Hoy)"}
                  {owed && " — Adeudado"}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className={styles.footer}>
        <span>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</span>
      </div>
    </div>
  );
}
