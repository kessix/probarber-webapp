import { NextResponse } from "next/server";
import { escapeHtml, sendEmail } from "@/lib/email";
import { formatBRL, maskPhone } from "@/lib/format";
import { supabaseAdmin } from "@/lib/supabase-admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Row = {
  id: string;
  starts_at: string;
  service_name: string;
  price_cents: number;
  status: string;
  payment_status: string;
  client_name: string;
  client_email: string | null;
  confirmation_sent_at: string | null;
  clients: { notifications: boolean; access_token: string } | null;
  barbershops: { slug: string; name: string; address: string | null; phone: string | null } | null;
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://probarberapp.com.br";

const when = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "full", timeStyle: "short" }).format(new Date(iso));

const paymentText = (status: string) =>
  status === "pago" ? "Pagamento confirmado." : status === "pendente" ? "Pagamento pendente: você paga na barbearia ou conclui o Pix." : "Você paga na barbearia, depois do atendimento.";

/**
 * Envia o e-mail de confirmação do agendamento. Só para quem aceitou notificações, só para o e-mail
 * informado no agendamento e no máximo uma vez: o id do agendamento sozinho não deixa mandar spam.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Agendamento inválido." }, { status: 400 });

  const db = supabaseAdmin();
  const { data: row, error } = await db
    .from("appointments")
    .select(
      "id, starts_at, service_name, price_cents, status, payment_status, client_name, client_email, confirmation_sent_at, clients(notifications, access_token), barbershops(slug, name, address, phone)",
    )
    .eq("id", id)
    .maybeSingle<Row>();
  if (error) {
    console.error("notify: leitura", error.message);
    return NextResponse.json({ error: "Não foi possível enviar." }, { status: 502 });
  }
  if (!row || row.status !== "agendado" || !row.client_email || !row.clients?.notifications || row.confirmation_sent_at) {
    return NextResponse.json({ sent: false });
  }

  // Reserva o envio antes de mandar: duas chamadas ao mesmo tempo não geram dois e-mails.
  const claim = await db
    .from("appointments")
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq("id", id)
    .is("confirmation_sent_at", null)
    .select("id");
  if (claim.error || (claim.data ?? []).length === 0) return NextResponse.json({ sent: false });

  const shop = row.barbershops;
  const lines = [
    `<p>Olá, ${escapeHtml(row.client_name)}!</p>`,
    `<p>Seu horário na <strong>${escapeHtml(shop?.name ?? "barbearia")}</strong> está confirmado.</p>`,
    `<table cellpadding="6" style="border-collapse:collapse">`,
    `<tr><td><strong>Serviço</strong></td><td>${escapeHtml(row.service_name)}</td></tr>`,
    `<tr><td><strong>Quando</strong></td><td>${escapeHtml(when(row.starts_at))}</td></tr>`,
    `<tr><td><strong>Valor</strong></td><td>${escapeHtml(formatBRL(row.price_cents / 100))}</td></tr>`,
    shop?.address ? `<tr><td><strong>Endereço</strong></td><td>${escapeHtml(shop.address)}</td></tr>` : "",
    `</table>`,
    `<p>${escapeHtml(paymentText(row.payment_status))}</p>`,
    shop && row.clients
      ? `<p><a href="${SITE}/${encodeURIComponent(shop.slug)}/meus-agendamentos?t=${row.clients.access_token}">Ver ou cancelar meus agendamentos</a></p>`
      : "",
    shop?.phone ? `<p>Para remarcar ou cancelar, fale com a barbearia: ${escapeHtml(maskPhone(shop.phone))}.</p>` : "",
  ];

  try {
    await sendEmail({
      to: row.client_email,
      subject: `Agendamento confirmado: ${shop?.name ?? "ProBarber"}`,
      html: lines.join(""),
    });
    return NextResponse.json({ sent: true });
  } catch {
    // Falhou: libera para uma nova tentativa.
    await db.from("appointments").update({ confirmation_sent_at: null }).eq("id", id);
    return NextResponse.json({ error: "Não foi possível enviar." }, { status: 502 });
  }
}
