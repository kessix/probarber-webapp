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
  handle: string;
  /** Cor da marca usada nos destaques da página. */
  color: string;
  mode: BookingMode;
  services: Service[];
  /** Horário de funcionamento, em horas (9 = 09:00). */
  hours: { from: number; to: number };
  /** Dias fechados (0 = domingo). */
  closedWeekdays: number[];
};

/** Slugs que pertencem a rotas fixas do sistema e não podem ser de uma barbearia. */
export const RESERVED_SLUGS = ["admin", "api", "login", "cadastro", "app"] as const;

/** Dados de exemplo até existir backend. */
export const BARBERSHOPS: Barbershop[] = [
  {
    slug: "doisirmaos",
    name: "Barbearia Dois Irmãos",
    handle: "@doisirmaosbarber",
    color: "#d4a24c",
    mode: "pagamento_opcional",
    services: [
      { id: "corte", name: "Corte", price: 45, minutes: 40 },
      { id: "degrade", name: "Degradê", price: 45, minutes: 45 },
      { id: "barba", name: "Barba", price: 35, minutes: 30 },
      { id: "corte-barba", name: "Corte + barba", price: 70, minutes: 70 },
    ],
    hours: { from: 9, to: 19 },
    closedWeekdays: [0],
  },
  {
    slug: "studiodobarba",
    name: "Studio do Barba",
    handle: "@studiodobarba",
    color: "#4aa57a",
    mode: "pagamento_obrigatorio",
    services: [
      { id: "corte", name: "Corte", price: 50, minutes: 40 },
      { id: "barba", name: "Barba", price: 40, minutes: 30 },
      { id: "corte-barba", name: "Corte + barba", price: 80, minutes: 70 },
    ],
    hours: { from: 10, to: 20 },
    closedWeekdays: [0, 1],
  },
  {
    slug: "barber013",
    name: "Barber 013",
    handle: "@barber013",
    color: "#6a8fd8",
    mode: "comum",
    services: [
      { id: "corte", name: "Corte", price: 40, minutes: 40 },
      { id: "sobrancelha", name: "Sobrancelha", price: 15, minutes: 15 },
      { id: "corte-barba", name: "Corte + barba", price: 65, minutes: 70 },
    ],
    hours: { from: 9, to: 18 },
    closedWeekdays: [0],
  },
];

export const getBarbershop = (slug: string) => BARBERSHOPS.find((b) => b.slug === slug);
