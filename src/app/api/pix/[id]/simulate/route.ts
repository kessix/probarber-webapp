import { NextResponse } from "next/server";
import { isDevMode, isPixId, simulatePixPayment } from "@/lib/abacatepay";

/** Simula o pagamento de um Pix de teste. Recusa quando a chave de API é de produção. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDevMode()) return NextResponse.json({ error: "Indisponível em produção." }, { status: 403 });

  const { id } = await params;
  if (!isPixId(id)) return NextResponse.json({ error: "Cobrança inválida." }, { status: 400 });

  try {
    const { status } = await simulatePixPayment(id);
    return NextResponse.json({ status });
  } catch {
    return NextResponse.json({ error: "Não foi possível simular o pagamento." }, { status: 502 });
  }
}
