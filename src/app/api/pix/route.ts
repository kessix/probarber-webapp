import { NextResponse } from "next/server";
import { createPixCharge } from "@/lib/abacatepay";
import { getBarbershop } from "@/lib/barbershops";

/** A AbacatePay recusa símbolos na descrição (ex.: "·"). Fica só letras sem acento, números e - . , */
const plainText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

/**
 * Cria a cobrança Pix de um agendamento.
 * O valor vem do serviço cadastrado no servidor, nunca do navegador.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { slug?: unknown; serviceId?: unknown } | null;
  if (typeof body?.slug !== "string" || typeof body.serviceId !== "string") {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const shop = await getBarbershop(body.slug);
  const service = shop?.services.find((s) => s.id === body.serviceId);
  if (!shop || !service) return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  if (shop.mode === "comum") {
    return NextResponse.json({ error: "Esta barbearia não cobra pelo app." }, { status: 400 });
  }

  try {
    const charge = await createPixCharge({
      amountCents: Math.round(service.price * 100),
      description: plainText(`${service.name} - ${shop.name}`),
      metadata: { barbershop: shop.slug, service: service.id },
    });
    return NextResponse.json({
      id: charge.id,
      amountCents: charge.amount,
      brCode: charge.brCode,
      qrCode: charge.brCodeBase64,
      expiresAt: charge.expiresAt,
      devMode: charge.devMode,
    });
  } catch {
    return NextResponse.json({ error: "Não foi possível gerar o Pix. Tente de novo." }, { status: 502 });
  }
}
