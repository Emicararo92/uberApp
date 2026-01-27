import { supabaseServer } from "../supabase/server";

export type AgendaDay = {
  id: string;
  date: string;
  base_amount: number;
  is_day_off: boolean;
  total_paid: number;
  financial_status: "pendiente" | "parcial" | "pagado" | "franco";
  day_debt: number;
  display_name: string;
};

export async function getAgendaWithStatus() {
  const supabase = await supabaseServer();

  /**
   * Esta query replica EXACTAMENTE
   * lo que validamos en SQL:
   * agenda + total pagado + estado + deuda.
   *
   * RLS se aplica automáticamente.
   */

  const { data, error } = await supabase.rpc("get_agenda_with_status");

  if (error) {
    console.error("Error cargando agenda:", error);
    throw new Error("No se pudo cargar la agenda");
  }

  return data as AgendaDay[];
}
