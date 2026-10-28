import { cache } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Como o cliente agenda e paga. Mesma definição do app (probarber-app):
 * - comum: sem pagamento no app, recebe na barbearia
 * - pagamento_obrigatorio: o horário só fecha com pagamento online (Pix)
 * - pagamento_opcional: paga online (Pix) ou escolhe pagar na barbearia
 */
export type BookingMode = "comum" | "pagamento_obrigatorio" | "pagamento_opcional";

export type Service = {
  id: string;
  name: string;
  /** Preço padrão, em reais. */
  price: number;
  minutes: number;
  photoUrl: string | null;
  /** Preço de dias específicos da semana (0 = domingo), em reais. Falta = vale o padrão. */
  dayPrices: Partial<Record<number, number>>;
};

export type Barbershop = {
  /** Vai na URL pública: probarberapp.com.br/{slug} */
  slug: string;
  name: string;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  googleReviewUrl: string | null;
  /** Cor da marca usada nos destaques da página. */
  color: string;
  mode: BookingMode;
  /** Quantos dias à frente o cliente pode agendar, contando hoje (1 a 14). */
  bookingWindowDays: number;
  services: Service[];
};

type Row = {
  slug: string;
  name: string;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  google_review_url: string | null;
  brand_color: string;
  booking_mode: BookingMode;
  booking_window_days: number;
  services: {
    id: string;
    name: string;
    price_cents: number;
    duration_minutes: number;
    active: boolean;
    photo_url: string | null;
    sort_order: number;
    service_day_prices: { weekday: number; price_cents: number }[];
  }[];
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
      "slug, name, logo_url, phone, address, instagram, facebook, google_review_url, brand_color, booking_mode, booking_window_days, " +
        "services(id, name, price_cents, duration_minutes, active, photo_url, sort_order, service_day_prices(weekday, price_cents))",
    )
    .eq("slug", slug)
    .maybeSingle<Row>();
  if (error) throw new Error(`Falha ao carregar a barbearia: ${error.message}`);
  if (!data) return null;

  return {
    slug: data.slug,
    name: data.name,
    logoUrl: data.logo_url,
    phone: data.phone,
    address: data.address,
    instagram: data.instagram,
    facebook: data.facebook,
    googleReviewUrl: data.google_review_url,
    color: data.brand_color,
    mode: data.booking_mode,
    bookingWindowDays: data.booking_window_days,
    services: data.services
      .filter((s) => s.active)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "pt-BR"))
      .map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price_cents / 100,
        minutes: s.duration_minutes,
        photoUrl: s.photo_url,
        dayPrices: Object.fromEntries(s.service_day_prices.map((p) => [p.weekday, p.price_cents / 100])),
      })),
  };
});

/** Preço do serviço no dia da semana (0 = domingo): o do dia, se houver, senão o padrão. */
export const priceOn = (service: Service, weekday: number) => service.dayPrices[weekday] ?? service.price;

/** Endereço de rede social digitado pelo barbeiro ("@user", "facebook.com/x" ou link) vira um link. */
export function socialUrl(kind: "instagram" | "facebook" | "web", value: string | null) {
  const text = value?.trim();
  if (!text) return null;
  if (/^https?:\/\//i.test(text)) return text;
  if (kind === "instagram") return `https://instagram.com/${text.replace(/^@/, "")}`;
  if (kind === "facebook") return `https://${text.replace(/^\/+/, "")}`;
  return null; // link do Google precisa ser um endereço completo
}
