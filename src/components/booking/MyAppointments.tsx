"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import type { Barbershop } from "@/lib/barbershops";
import { isToken, loadToken, saveToken } from "@/lib/client-memory";
import { formatBRL, formatDayLong, fromDateKey } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { ShopHeader } from "./ShopHeader";
import "./booking.css";

type Item = {
  id: string;
  starts_at: string;
  service_name: string;
  price_cents: number;
  status: "agendado" | "concluido" | "cancelado";
  payment_status: "nao_aplicavel" | "pendente" | "pago";
  can_cancel: boolean;
};

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
const dayKeyOf = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

type State = { kind: "loading" } | { kind: "empty" } | { kind: "error" } | { kind: "ok"; items: Item[] };

export function MyAppointments({ shop }: { shop: Barbershop }) {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // O código vem do link do e-mail (?t=) ou do que este aparelho já guardou.
  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get("t");
    let found: string | null = null;
    if (isToken(fromLink)) {
      saveToken(shop.slug, fromLink);
      window.history.replaceState(null, "", window.location.pathname); // tira o código da barra de endereço
      found = fromLink;
    } else {
      found = loadToken(shop.slug);
    }
    Promise.resolve().then(() => {
      if (found) setToken(found);
      else setState({ kind: "empty" });
    });
  }, [shop.slug]);

  async function load(code: string) {
    const { data, error } = await supabase.rpc("my_appointments", { p_slug: shop.slug, p_token: code });
    if (error) setState({ kind: "error" });
    else setState((data as Item[]).length === 0 ? { kind: "empty" } : { kind: "ok", items: data as Item[] });
  }

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    supabase.rpc("my_appointments", { p_slug: shop.slug, p_token: token }).then(({ data, error }) => {
      if (cancelled) return;
      if (error) setState({ kind: "error" });
      else setState((data as Item[]).length === 0 ? { kind: "empty" } : { kind: "ok", items: data as Item[] });
    });
    return () => {
      cancelled = true;
    };
  }, [shop.slug, token]);

  async function cancel(item: Item) {
    if (!token) return;
    const when = `${formatDayLong(fromDateKey(dayKeyOf(item.starts_at)))} às ${timeOf(item.starts_at)}`;
    if (!window.confirm(`Cancelar ${item.service_name}, ${when}?`)) return;
    setBusy(item.id);
    setMessage(null);
    const { error } = await supabase.rpc("cancel_my_appointment", {
      p_slug: shop.slug,
      p_token: token,
      p_appointment_id: item.id,
    });
    setBusy(null);
    if (error) {
      setMessage(
        error.message.includes("prazo_cancelamento")
          ? "Só é possível cancelar com pelo menos 2 horas de antecedência. Fale com a barbearia."
          : "Não foi possível cancelar. Tente de novo.",
      );
    } else {
      setMessage(
        item.payment_status === "pago"
          ? "Agendamento cancelado. Você já pagou por Pix: combine o reembolso com a barbearia."
          : "Agendamento cancelado.",
      );
    }
    await load(token);
  }

  return (
    <main className="bk" style={{ "--brand": shop.color } as CSSProperties}>
      <div className="bk-wrap">
        <ShopHeader shop={shop} />
        <Link className="bk-back" href={`/${shop.slug}`}>
          <ChevronLeft size={16} /> Novo agendamento
        </Link>

        <section>
          <h2>Meus agendamentos</h2>
          {message ? <p className="bk-sub">{message}</p> : null}

          {state.kind === "loading" ? <p className="bk-sub">Carregando…</p> : null}
          {state.kind === "error" ? <p className="bk-error">Não foi possível carregar. Tente de novo.</p> : null}
          {state.kind === "empty" ? (
            <p className="bk-sub">
              Nenhum agendamento neste aparelho. Se você agendou em outro aparelho, abra o link que enviamos no
              e-mail de confirmação.
            </p>
          ) : null}

          {state.kind === "ok" ? (
            <div className="bk-list">
              {state.items.map((item) => (
                <div key={item.id} className={`bk-appt ${item.status}`}>
                  <div className="bk-appt-main">
                    <strong>{item.service_name}</strong>
                    <small>
                      {formatDayLong(fromDateKey(dayKeyOf(item.starts_at)))} às {timeOf(item.starts_at)}
                    </small>
                    <small>
                      {formatBRL(item.price_cents / 100)} ·{" "}
                      {item.status === "cancelado"
                        ? "Cancelado"
                        : item.status === "concluido"
                          ? "Concluído"
                          : item.payment_status === "pago"
                            ? "Pago"
                            : item.payment_status === "pendente"
                              ? "Pagamento pendente"
                              : "Pagamento na barbearia"}
                    </small>
                  </div>
                  {item.can_cancel ? (
                    <button type="button" className="bk-ghost" disabled={busy === item.id} onClick={() => void cancel(item)}>
                      {busy === item.id ? "Cancelando…" : "Cancelar"}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          <p className="bk-demo">Cancelamentos só até 2 horas antes do horário.</p>
        </section>
      </div>
    </main>
  );
}
