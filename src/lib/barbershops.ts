import { cache } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Como o cliente agenda e paga. Mesma definição do app (probarber-app):
 * - comum: sem pagamento no app, recebe na barbearia
 * - pagamento_obrigatorio: o horário só fecha com pagamento online (Pix)
 * - pagamento_opcional: paga online (Pix) ou escolhe pagar na barbearia
 */
export type BookingMode = "comum" | "pagamento_obrigatorio" | "pagamento_opcional";

export type Service = { id: string; name: string; price: number; minutes: number };

export type Barbershop = {
  /** Vai na URL pública: probarberapp.com.br/{slug} */
  slug: string;
  name: string;
  instagram: string | null;
  /** Cor da marca usada nos destaques da página. */
  color: string;
  mode: BookingMode;
  services: Service[];
  /** Horário de funcionamento, em horas (9 = 09:00). */
  hours: { from: number; to: number };
  /** Dias fechados (0 = domingo). */
  closedWeekdays: number[];
};

type Row = {
  slug: string;
  name: string;
  instagram: string | null;
  brand_color: string;
  booking_mode: BookingMode;
  opening_hour: number;
  closing_hour: number;
  closed_weekdays: number[];
  services: { id: string; name: string; price_cents: number; duration_minutes: number; active: boolean }[];
};

// Mesma regra de endereço do banco: evita consultar com lixo vindo da URL.
const SLUG = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

/**
 * Barbearia pública pelo endereço. Devolve null se não existir.
 * Falha de rede ou do banco lança erro, para não virar um 404 enganoso.
 * `cache` evita ler duas vezes na mesma requisição (página e metadados).
 */
export const getBarbershop = cache(async (slug: string): Promise<Barbershop | null> => {
  if (!SLUG.test(slug)) return null;

  const { data, error } = await supabase
    .from("barbershops")
    .select(
      "slug, name, instagram, brand_color, booking_mode, opening_hour, closing_hour, closed_weekdays, services(id, name, price_cents, duration_minutes, active)",
    )
    .eq("slug", slug)
    .maybeSingle<Row>();
  if (error) throw new Error(`Falha ao carregar a barbearia: ${error.message}`);
  if (!data) return null;

  return {
    slug: data.slug,
    name: data.name,
    instagram: data.instagram,
    color: data.brand_color,
    mode: data.booking_mode,
    hours: { from: data.opening_hour, to: data.closing_hour },
    closedWeekdays: data.closed_weekdays,
    services: data.services
      .filter((s) => s.active)
      .map((s) => ({ id: s.id, name: s.name, price: s.price_cents / 100, minutes: s.duration_minutes })),
  };
});
