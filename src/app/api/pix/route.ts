import { NextResponse } from "next/server";
import { createPixCharge } from "@/lib/abacatepay";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** A AbacatePay recusa símbolos na descrição (ex.: "·"). Fica só letras sem acento, números e - . , */
const plainText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AppointmentRow = {
  id: string;
  price_cents: number;
  service_name: string;
  status: string;
  payment_status: string;
  payment_online: boolean;
  barbershops: { name: string } | null;
};

/**
 * Cria a cobrança Pix de um agendamento que o cliente acabou de fazer.
 * O valor vem do agendamento no banco, nunca do navegador, e a cobrança fica ligada a ele
 * para o pagamento ser confirmado automaticamente.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { appointmentId?: unknown } | null;
  if (typeof body?.appointmentId !== "string" || !UUID.test(body.appointmentId)) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: appointment, error } = await db
    .from("appointments")
    .select("id, price_cents, service_name, status, payment_status, payment_online, barbershops(name)")
    .eq("id", body.appointmentId)
    .maybeSingle<AppointmentRow>();
  if (error) {
    console.error("pix: leitura do agendamento", error.message);
    return NextResponse.json({ error: "Não foi possível gerar o Pix. Tente de novo." }, { status: 502 });
  }
  if (!appointment) return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });

  // Só agendamentos que aguardam Pix: não cobra de novo o que já foi pago ou cancelado.
  if (appointment.status !== "agendado" || appointment.payment_status !== "pendente" || !appointment.payment_online) {
    return NextResponse.json({ error: "Este agendamento não aguarda pagamento." }, { status: 409 });
  }

  try {
    const charge = await createPixCharge({
      amountCents: appointment.price_cents,
      description: plainText(`${appointment.service_name} - ${appointment.barbershops?.name ?? "ProBarber"}`),
      metadata: { appointmentId: appointment.id },
    });

    const { error: linkError } = await db
      .from("appointments")
      .update({ pix_charge_id: charge.id })
      .eq("id", appointment.id);
    if (linkError) throw new Error(linkError.message);

    return NextResponse.json({
      id: charge.id,
      amountCents: charge.amount,
      brCode: charge.brCode,
      qrCode: charge.brCodeBase64,
      expiresAt: charge.expiresAt,
      devMode: charge.devMode,
    });
  } catch (err) {
    console.error("pix: criação da cobrança", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Não foi possível gerar o Pix. Tente de novo." }, { status: 502 });
  }
}
