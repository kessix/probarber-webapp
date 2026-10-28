"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, ChevronLeft, Clock, Copy, MapPin, Phone, QrCode, Scissors, Star, Store } from "lucide-react";
import { priceOn, socialUrl, type Barbershop, type Service } from "@/lib/barbershops";
import { formatBRL, formatDayLong, fromDateKey, weekdayShort } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import "./booking.css";

type Step = "dados" | "servico" | "horario" | "pagamento" | "pix" | "ok";
type Paid = "pix" | "local" | null;
type Pix = { id: string; brCode: string; qrCode: string; expiresAt: string; devMode: boolean };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "2026-10-29T12:00:00+00:00" -> "09:00" no horário de Brasília */
const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });

const weekdayOf = (dayKey: string) => fromDateKey(dayKey).getDay();

export function BookingFlow({ shop }: { shop: Barbershop }) {
  const [step, setStep] = useState<Step>("dados");

  // 1) quem está agendando
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(false);

  // 2) serviço e 3) horário, ambos vindos do banco
  const [service, setService] = useState<Service | null>(null);
  const [days, setDays] = useState<string[] | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const daysRequest = useRef(0);
  const slotsRequest = useRef(0);

  // 4) agendamento e pagamento
  const [saving, setSaving] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [paid, setPaid] = useState<Paid>(null);
  const [pix, setPix] = useState<Pix | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const dadosOk = name.trim().length >= 2 && EMAIL.test(email.trim());
  const price = service && day ? priceOn(service, weekdayOf(day)) : (service?.price ?? 0);

  const back: Partial<Record<Step, Step>> = {
    servico: "dados",
    horario: "servico",
    pagamento: "horario",
    // sem "voltar" no Pix: o agendamento já foi criado e segura o horário
  };

  /** Um e-mail de confirmação por agendamento, se o cliente aceitou notificações. Falha em silêncio. */
  function notify(id: string) {
    if (!notifications) return;
    fetch(`/api/appointments/${id}/notify`, { method: "POST" }).catch(() => undefined);
  }

  // Enquanto o QR Code está na tela, consulta o pagamento a cada 3 segundos.
  useEffect(() => {
    if (step !== "pix" || !pix || !appointmentId) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/${pix.id}`);
        const data = (await res.json()) as { status?: string };
        if (data.status === "PAID") {
          setPaid("pix");
          setStep("ok");
          notify(appointmentId);
        } else if (data.status === "EXPIRED" || data.status === "CANCELLED") {
          setPix(null);
          setPixError("O Pix expirou. Gere um novo código.");
        }
      } catch {
        /* falha de rede passageira: tenta de novo no próximo ciclo */
      }
    }, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pix, appointmentId]);

  async function chooseDay(key: string, forService: Service) {
    setDay(key);
    setSlot(null);
    setSlots(null);
    const id = ++slotsRequest.current;
    const { data, error } = await supabase.rpc("available_slots", {
      p_slug: shop.slug,
      p_service_id: forService.id,
      p_day: key,
    });
    if (id !== slotsRequest.current) return; // já escolheu outro dia
    setSlots(error ? [] : (data as { starts_at: string }[]).map((r) => r.starts_at));
  }

  async function chooseService(chosen: Service) {
    setService(chosen);
    setDays(null);
    setDay(null);
    setSlots(null);
    setSlot(null);
    setScheduleError(null);
    setBookingError(null);
    setStep("horario");

    const id = ++daysRequest.current;
    const { data, error } = await supabase.rpc("available_days", { p_slug: shop.slug, p_service_id: chosen.id });
    if (id !== daysRequest.current) return;
    if (error) {
      setScheduleError("Não foi possível carregar a agenda. Volte e tente de novo.");
      setDays([]);
      return;
    }
    const list = (data as { day: string }[]).map((r) => r.day);
    setDays(list);
    if (list[0]) await chooseDay(list[0], chosen);
  }

  /** Grava o agendamento. O preço e as regras de horário são conferidos no banco. */
  async function book(payOnline: boolean): Promise<string | null> {
    if (!service || !slot) return null;
    setSaving(true);
    setBookingError(null);
    const { data, error } = await supabase.rpc("create_appointment", {
      p_slug: shop.slug,
      p_service_id: service.id,
      p_starts_at: slot,
      p_client_name: name.trim(),
      p_client_email: email.trim(),
      p_client_phone: null,
      p_notifications: notifications,
      p_pay_online: payOnline,
    });
    setSaving(false);
    if (!error && typeof data === "string") {
      setAppointmentId(data);
      return data;
    }

    const message = error?.message ?? "";
    if (message.includes("horario_indisponivel")) {
      setBookingError("Esse horário acabou de ser ocupado. Escolha outro.");
      if (day) await chooseDay(day, service);
      setStep("horario");
    } else if (message.includes("email_invalido")) {
      setBookingError("Confira o e-mail digitado.");
      setStep("dados");
    } else if (message.includes("cliente_bloqueado")) {
      setBookingError(
        shop.phone
          ? "Não foi possível concluir o agendamento. Fale com a barbearia."
          : "Não foi possível concluir o agendamento. Entre em contato com a barbearia.",
      );
    } else {
      setBookingError("Não foi possível agendar. Tente de novo.");
    }
    return null;
  }

  async function startPix(id: string) {
    setPix(null);
    setPixError(null);
    setStep("pix");
    try {
      const res = await fetch("/api/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id }),
      });
      const data = (await res.json()) as Partial<Pix> & { error?: string };
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

  async function confirm() {
    if (shop.mode === "pagamento_opcional") {
      setBookingError(null);
      setStep("pagamento");
      return;
    }
    const online = shop.mode === "pagamento_obrigatorio";
    const id = await book(online);
    if (!id) return;
    if (online) await startPix(id);
    else {
      setStep("ok");
      notify(id);
    }
  }

  async function payWithPix() {
    const id = await book(true);
    if (id) await startPix(id);
  }

  async function payAtShop() {
    const id = await book(false);
    if (!id) return;
    setPaid("local");
    setStep("ok");
    notify(id);
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

  const instagram = socialUrl("instagram", shop.instagram);
  const facebook = socialUrl("facebook", shop.facebook);
  const google = socialUrl("web", shop.googleReviewUrl);
  const previous = back[step];

  return (
    <main className="bk" style={{ "--brand": shop.color } as CSSProperties}>
      <div className="bk-wrap">
        <header className="bk-head">
          {shop.logoUrl ? (
            <Image className="bk-logo-img" src={shop.logoUrl} alt={`Logo da ${shop.name}`} width={88} height={88} unoptimized priority />
          ) : (
            <span className="bk-logo"><Scissors size={22} /></span>
          )}
          <h1>{shop.name}</h1>
          {shop.address ? <p className="bk-meta"><MapPin size={13} /> {shop.address}</p> : null}
          <div className="bk-links">
            {shop.phone ? <a href={`tel:+55${shop.phone}`}><Phone size={13} /> Ligar</a> : null}
            {instagram ? <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a> : null}
            {facebook ? <a href={facebook} target="_blank" rel="noopener noreferrer">Facebook</a> : null}
            {google ? <a href={google} target="_blank" rel="noopener noreferrer"><Star size={13} /> Avaliações</a> : null}
          </div>
        </header>

        {previous ? (
          <button type="button" className="bk-back" onClick={() => setStep(previous)}>
            <ChevronLeft size={16} /> Voltar
          </button>
        ) : null}

        {step === "dados" && (
          <section>
            <h2>Vamos agendar</h2>
            <p className="bk-sub">Primeiro, nos diga quem você é.</p>
            {bookingError ? <p className="bk-error">{bookingError}</p> : null}
            <label className="bk-field">
              <span>Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Como podemos te chamar?" maxLength={80} />
            </label>
            <label className="bk-field">
              <span>E-mail</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                placeholder="voce@email.com"
              />
            </label>
            <label className="bk-consent">
              <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
              <span>Quero receber a confirmação e o lembrete do meu horário por e-mail.</span>
            </label>
            <button
              type="button"
              className="bk-cta"
              disabled={!dadosOk}
              onClick={() => {
                setBookingError(null);
                setStep("servico");
              }}>
              Continuar
            </button>
          </section>
        )}

        {step === "servico" && (
          <section>
            <h2>Escolha o serviço</h2>
            {shop.services.length === 0 ? (
              <p className="bk-sub">Esta barbearia ainda não cadastrou serviços para agendamento.</p>
            ) : (
              <div className="bk-list">
                {shop.services.map((s) => (
                  <button key={s.id} type="button" className={`bk-card ${service?.id === s.id ? "on" : ""}`} onClick={() => void chooseService(s)}>
                    {s.photoUrl ? (
                      <Image className="bk-svc-photo" src={s.photoUrl} alt="" width={64} height={64} unoptimized />
                    ) : null}
                    <span className="bk-svc-text">
                      <strong>{s.name}</strong>
                      <small><Clock size={12} /> {s.minutes} min</small>
                    </span>
                    <b>{formatBRL(s.price)}</b>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {step === "horario" && service && (
          <section>
            <h2>Escolha o dia e o horário</h2>
            <p className="bk-sub">
              {service.name} · {formatBRL(price)}
              {day && price !== service.price ? " neste dia" : ""}
            </p>
            {bookingError ? <p className="bk-error">{bookingError}</p> : null}
            {scheduleError ? <p className="bk-error">{scheduleError}</p> : null}

            {days === null ? (
              <p className="bk-sub">Carregando a agenda…</p>
            ) : days.length === 0 ? (
              !scheduleError && <p className="bk-sub">Não há horários disponíveis nos próximos dias para este serviço.</p>
            ) : (
              <>
                <div className="bk-days">
                  {days.map((key) => {
                    const d = fromDateKey(key);
                    return (
                      <button key={key} type="button" className={`bk-day ${key === day ? "on" : ""}`} onClick={() => void chooseDay(key, service)}>
                        <small>{weekdayShort(d)}</small>
                        <b>{d.getDate()}</b>
                      </button>
                    );
                  })}
                </div>
                {day ? <p className="bk-sub">{formatDayLong(fromDateKey(day))}</p> : null}
                {slots === null ? (
                  <p className="bk-sub">Carregando horários…</p>
                ) : (
                  <div className="bk-slots">
                    {slots.map((iso) => (
                      <button key={iso} type="button" className={`bk-slot ${slot === iso ? "on" : ""}`} onClick={() => setSlot(iso)}>
                        {timeOf(iso)}
                      </button>
                    ))}
                  </div>
                )}
                <button type="button" className="bk-cta" disabled={!slot || saving} onClick={() => void confirm()}>
                  {saving
                    ? "Agendando…"
                    : shop.mode === "comum"
                      ? "Confirmar agendamento"
                      : shop.mode === "pagamento_obrigatorio"
                        ? "Pagar com Pix e confirmar"
                        : "Continuar"}
                </button>
              </>
            )}
          </section>
        )}

        {step === "pagamento" && service && (
          <section>
            <h2>Como você quer pagar?</h2>
            <p className="bk-sub">Total: {formatBRL(price)}</p>
            {bookingError ? <p className="bk-error">{bookingError}</p> : null}
            <div className="bk-list">
              <button type="button" className="bk-card" disabled={saving} onClick={() => void payWithPix()}>
                <span className="bk-svc-text">
                  <strong><QrCode size={15} /> Pagar agora com Pix</strong>
                  <small>Seu horário fica garantido na hora.</small>
                </span>
              </button>
              <button type="button" className="bk-card" disabled={saving} onClick={() => void payAtShop()}>
                <span className="bk-svc-text">
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
            <div className="bk-total"><small>Total</small><b>{formatBRL(price)}</b></div>

            {pixError ? (
              <>
                <p className="bk-error">{pixError}</p>
                {appointmentId ? (
                  <button type="button" className="bk-cta" onClick={() => void startPix(appointmentId)}>Gerar novo Pix</button>
                ) : null}
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

        {step === "ok" && service && day && slot && (
          <section className="bk-ok">
            <span className="bk-check"><Check size={30} /></span>
            <h2>Agendamento confirmado!</h2>
            <p className="bk-sub">
              {paid === "pix"
                ? "Pagamento com Pix confirmado."
                : paid === "local"
                  ? "Pagamento pendente: você paga na barbearia."
                  : "Você paga na barbearia, depois do atendimento."}
              {notifications ? " Enviaremos a confirmação para o seu e-mail." : ""}
            </p>
            <dl className="bk-summary">
              <div><dt>Serviço</dt><dd>{service.name}</dd></div>
              <div><dt>Quando</dt><dd>{formatDayLong(fromDateKey(day))} às {timeOf(slot)}</dd></div>
              <div><dt>Cliente</dt><dd>{name.trim()}</dd></div>
              <div><dt>Valor</dt><dd>{formatBRL(price)}</dd></div>
            </dl>
          </section>
        )}
      </div>
    </main>
  );
}
