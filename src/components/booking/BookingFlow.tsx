"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Check, ChevronLeft, Clock, Copy, QrCode, Scissors, Store } from "lucide-react";
import type { Barbershop, Service } from "@/lib/barbershops";
import { supabase } from "@/lib/supabase";
import { formatBRL, formatDayLong, formatTime, fromDateKey, maskPhone, toDateKey, weekdayShort } from "@/lib/format";
import "./booking.css";

type Step = "servico" | "horario" | "dados" | "pagamento" | "pix" | "ok";
type Paid = "pix" | "local" | null;
type Pix = { id: string; brCode: string; qrCode: string; expiresAt: string; devMode: boolean };

const DAYS_AHEAD = 10;
const SLOT_MINUTES = 30;

// Relógio do cliente. No servidor devolve null: evita Date durante o prerender.
const subscribe = () => () => {};
const getNow = () => Math.floor(Date.now() / 60_000) * 60_000;
const getServerNow = () => null;

// O Brasil não tem horário de verão: o fuso de Brasília é fixo em -03:00.
const BR_OFFSET = "-03:00";
const MIN_NOTICE_MS = 30 * 60_000;

const slotInstant = (dateKey: string, minutes: number) => Date.parse(`${dateKey}T${formatTime(minutes)}:00${BR_OFFSET}`);

function buildSlots(shop: Barbershop, service: Service, dateKey: string, nowMs: number, taken: Set<number>) {
  const slots: { time: string; available: boolean }[] = [];
  for (let m = shop.hours.from * 60; m + service.minutes <= shop.hours.to * 60; m += SLOT_MINUTES) {
    const at = slotInstant(dateKey, m);
    slots.push({ time: formatTime(m), available: at > nowMs + MIN_NOTICE_MS && !taken.has(at) });
  }
  return slots;
}

export function BookingFlow({ shop }: { shop: Barbershop }) {
  const nowMs = useSyncExternalStore<number | null>(subscribe, getNow, getServerNow);
  const [step, setStep] = useState<Step>("servico");
  const [service, setService] = useState<Service | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paid, setPaid] = useState<Paid>(null);
  const [copied, setCopied] = useState(false);
  const [pix, setPix] = useState<Pix | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  // Horários ocupados do dia selecionado, vindos do banco.
  const [taken, setTaken] = useState<{ day: string; at: Set<number> } | null>(null);
  const [reloadTaken, setReloadTaken] = useState(0);

  const days = useMemo(() => {
    if (nowMs === null) return [];
    const base = new Date(nowMs);
    const list: Date[] = [];
    for (let i = 0; list.length < DAYS_AHEAD; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      if (!shop.closedWeekdays.includes(d.getDay())) list.push(d);
    }
    return list;
  }, [nowMs, shop.closedWeekdays]);

  const selectedDay = dateKey ?? (days[0] ? toDateKey(days[0]) : null);
  const slotsReady = taken !== null && taken.day === selectedDay;
  const slots = useMemo(
    () =>
      nowMs !== null && service && selectedDay && taken && taken.day === selectedDay
        ? buildSlots(shop, service, selectedDay, nowMs, taken.at)
        : [],
    [nowMs, shop, service, selectedDay, taken],
  );

  useEffect(() => {
    if (!selectedDay) return;
    let active = true;
    supabase.rpc("taken_slots", { p_slug: shop.slug, p_day: selectedDay }).then(({ data }) => {
      if (!active) return;
      const rows = (data ?? []) as { starts_at: string }[];
      setTaken({ day: selectedDay, at: new Set(rows.map((r) => Date.parse(r.starts_at))) });
    });
    return () => {
      active = false;
    };
  }, [shop.slug, selectedDay, reloadTaken]);

  const phoneDigits = phone.replace(/\D/g, "");
  const dadosOk = name.trim().length >= 2 && (phoneDigits.length === 10 || phoneDigits.length === 11);

  const back: Partial<Record<Step, Step>> = {
    horario: "servico",
    dados: "horario",
    pagamento: "dados",
    // sem "voltar" no Pix: o agendamento já foi criado e segura o horário
  };

  // Enquanto o QR Code está na tela, consulta o pagamento a cada 3 segundos.
  useEffect(() => {
    if (step !== "pix" || !pix) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/${pix.id}`);
        const data = (await res.json()) as { status?: string };
        if (data.status === "PAID") {
          setPaid("pix");
          setStep("ok");
        } else if (data.status === "EXPIRED" || data.status === "CANCELLED") {
          setPix(null);
          setPixError("O Pix expirou. Gere um novo código.");
        }
      } catch {
        /* falha de rede passageira: tenta de novo no próximo ciclo */
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [step, pix]);

  async function startPix(forId?: string) {
    const target = forId ?? appointmentId;
    if (!target) return;
    setPix(null);
    setPixError(null);
    setStep("pix");
    try {
      const res = await fetch("/api/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: target }),
      });
      const data = (await res.json()) as Partial<Pix> & { error?: string; qrCode?: string };
      if (!res.ok || !data.id || !data.brCode || !data.qrCode || !data.expiresAt) {
        setPixError(data.error ?? "Não foi possível gerar o Pix. Tente de novo.");
        return;
      }
      setPix({ id: data.id, brCode: data.brCode, qrCode: data.qrCode, expiresAt: data.expiresAt, devMode: Boolean(data.devMode) });
    } catch {
      setPixError("Sem conexão. Verifique a internet e tente de novo.");
    }
  }

  async function simulatePayment() {
    if (!pix) return;
    setSimulating(true);
    try {
      await fetch(`/api/pix/${pix.id}/simulate`, { method: "POST" });
      // a confirmação chega pela consulta periódica acima
    } finally {
      setSimulating(false);
    }
  }

  function goBack() {
    if (step === "pix") {
      setPix(null);
      setPixError(null);
    }
    const previous = back[step];
    if (previous) setStep(previous);
  }

  /** Grava o agendamento no banco e devolve o id dele. O preço vem do serviço, não do navegador. */
  async function book(payOnline: boolean): Promise<string | null> {
    if (!service || !selectedDay || !time) return null;
    setSaving(true);
    setBookingError(null);
    const startsAt = new Date(Date.parse(`${selectedDay}T${time}:00${BR_OFFSET}`)).toISOString();
    const { data, error } = await supabase.rpc("create_appointment", {
      p_slug: shop.slug,
      p_service_id: service.id,
      p_starts_at: startsAt,
      p_client_name: name.trim(),
      p_client_phone: phoneDigits,
      p_pay_online: payOnline,
    });
    setSaving(false);
    if (!error && typeof data === "string") {
      setAppointmentId(data);
      return data;
    }

    const message = error?.message ?? "";
    if (message.includes("horario_indisponivel") || message.includes("horario_no_passado")) {
      setBookingError("Esse horário não está mais disponível. Escolha outro.");
      setTime(null);
      setReloadTaken((n) => n + 1);
      setStep("horario");
    } else {
      setBookingError("Não foi possível agendar. Tente de novo.");
    }
    return null;
  }

  async function afterDados() {
    if (shop.mode === "pagamento_opcional") {
      setStep("pagamento");
      return;
    }
    const online = shop.mode === "pagamento_obrigatorio";
    const id = await book(online);
    if (!id) return;
    if (online) await startPix(id);
    else setStep("ok");
  }

  async function payWithPix() {
    const id = await book(true);
    if (id) await startPix(id);
  }

  async function payAtShop() {
    if (!(await book(false))) return;
    setPaid("local");
    setStep("ok");
  }

  async function copyPix() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sem permissão de clipboard: o código continua visível para copiar à mão */
    }
  }

  const day = selectedDay ? fromDateKey(selectedDay) : null;

  return (
    <main className="bk" style={{ "--brand": shop.color } as CSSProperties}>
      <div className="bk-wrap">
        <header className="bk-head">
          <span className="bk-logo"><Scissors size={22} /></span>
          <h1>{shop.name}</h1>
          {shop.instagram ? <p>{shop.instagram}</p> : null}
        </header>

        {back[step] ? (
          <button type="button" className="bk-back" onClick={goBack}>
            <ChevronLeft size={16} /> Voltar
          </button>
        ) : null}

        {step === "servico" && (
          <section>
            <h2>Escolha o serviço</h2>
            <div className="bk-list">
              {shop.services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`bk-card ${service?.id === s.id ? "on" : ""}`}
                  onClick={() => {
                    setService(s);
                    setTime(null);
                    setStep("horario");
                  }}>
                  <span>
                    <strong>{s.name}</strong>
                    <small><Clock size={12} /> {s.minutes} min</small>
                  </span>
                  <b>{formatBRL(s.price)}</b>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === "horario" && service && (
          <section>
            <h2>Escolha o horário</h2>
            <p className="bk-sub">{service.name} · {formatBRL(service.price)}</p>
            {bookingError ? <p className="bk-error">{bookingError}</p> : null}
            {nowMs === null ? (
              <p className="bk-sub">Carregando horários…</p>
            ) : (
              <>
                <div className="bk-days">
                  {days.map((d) => {
                    const key = toDateKey(d);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`bk-day ${key === selectedDay ? "on" : ""}`}
                        onClick={() => {
                          setDateKey(key);
                          setTime(null);
                        }}>
                        <small>{weekdayShort(d)}</small>
                        <b>{d.getDate()}</b>
                      </button>
                    );
                  })}
                </div>
                {day ? <p className="bk-sub">{formatDayLong(day)}</p> : null}
                {!slotsReady ? <p className="bk-sub">Carregando horários…</p> : null}
                <div className="bk-slots">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      className={`bk-slot ${time === s.time ? "on" : ""}`}
                      onClick={() => setTime(s.time)}>
                      {s.time}
                    </button>
                  ))}
                </div>
                {slotsReady && slots.every((s) => !s.available) ? (
                  <p className="bk-sub">Sem horários livres neste dia. Escolha outro dia.</p>
                ) : null}
                <button type="button" className="bk-cta" disabled={!time} onClick={() => setStep("dados")}>
                  Continuar
                </button>
              </>
            )}
          </section>
        )}

        {step === "dados" && service && day && time && (
          <section>
            <h2>Seus dados</h2>
            <p className="bk-sub">{service.name} · {formatDayLong(day)} às {time}</p>
            <label className="bk-field">
              <span>Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Como podemos te chamar?" />
            </label>
            <label className="bk-field">
              <span>WhatsApp</span>
              <input
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 91234-5678"
              />
            </label>
            {bookingError ? <p className="bk-error">{bookingError}</p> : null}
            <button type="button" className="bk-cta" disabled={!dadosOk || saving} onClick={() => void afterDados()}>
              {saving ? "Agendando…" : shop.mode === "comum" ? "Confirmar agendamento" : "Continuar"}
            </button>
          </section>
        )}

        {step === "pagamento" && service && (
          <section>
            <h2>Como você quer pagar?</h2>
            <p className="bk-sub">Total: {formatBRL(service.price)}</p>
            {bookingError ? <p className="bk-error">{bookingError}</p> : null}
            <div className="bk-list">
              <button
                type="button"
                className="bk-card"
                disabled={saving}
                onClick={() => void payWithPix()}>
                <span>
                  <strong><QrCode size={15} /> Pagar agora com Pix</strong>
                  <small>Seu horário fica garantido na hora.</small>
                </span>
              </button>
              <button
                type="button"
                className="bk-card"
                disabled={saving}
                onClick={() => void payAtShop()}>
                <span>
                  <strong><Store size={15} /> Pagar na barbearia</strong>
                  <small>Você paga depois do atendimento.</small>
                </span>
              </button>
            </div>
          </section>
        )}

        {step === "pix" && service && (
          <section>
            <h2>Pague com Pix</h2>
            <p className="bk-sub">
              {shop.mode === "pagamento_obrigatorio"
                ? "O horário só é confirmado depois do pagamento."
                : "Escaneie o QR Code ou copie o código no app do seu banco."}
            </p>
            <div className="bk-total"><small>Total</small><b>{formatBRL(service.price)}</b></div>

            {pixError ? (
              <>
                <p className="bk-error">{pixError}</p>
                <button type="button" className="bk-cta" onClick={() => void startPix()}>Gerar novo Pix</button>
              </>
            ) : !pix ? (
              <p className="bk-sub">Gerando o Pix…</p>
            ) : (
              <>
                <div className="bk-pix">
                  <Image className="bk-qr" src={pix.qrCode} alt="QR Code do Pix" width={220} height={220} unoptimized />
                  <code>{pix.brCode}</code>
                  <button type="button" className="bk-ghost" onClick={copyPix}>
                    {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar código</>}
                  </button>
                </div>
                <p className="bk-demo">Aguardando o pagamento… esta tela confirma sozinha.</p>
                {pix.devMode ? (
                  <>
                    <p className="bk-demo">Modo de teste: nenhum valor é cobrado de verdade.</p>
                    <button type="button" className="bk-cta" disabled={simulating} onClick={simulatePayment}>
                      {simulating ? "Simulando…" : "Simular pagamento (teste)"}
                    </button>
                  </>
                ) : null}
              </>
            )}
          </section>
        )}

        {step === "ok" && service && day && time && (
          <section className="bk-ok">
            <span className="bk-check"><Check size={30} /></span>
            <h2>Agendamento confirmado!</h2>
            <p className="bk-sub">
              {paid === "pix"
                ? "Pagamento com Pix confirmado."
                : paid === "local"
                  ? "Pagamento pendente: você paga na barbearia."
                  : "Você paga na barbearia, depois do atendimento."}
            </p>
            <dl className="bk-summary">
              <div><dt>Serviço</dt><dd>{service.name}</dd></div>
              <div><dt>Quando</dt><dd>{formatDayLong(day)} às {time}</dd></div>
              <div><dt>Cliente</dt><dd>{name.trim()}</dd></div>
              <div><dt>Valor</dt><dd>{formatBRL(service.price)}</dd></div>
            </dl>
          </section>
        )}
      </div>
    </main>
  );
}
