import { NextResponse } from "next/server";
import { checkPixCharge, isPixId } from "@/lib/abacatepay";

/** Status de uma cobrança Pix, para a página consultar até o pagamento cair. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isPixId(id)) return NextResponse.json({ error: "Cobrança inválida." }, { status: 400 });

  try {
    const { status, expiresAt } = await checkPixCharge(id);
    return NextResponse.json({ status, expiresAt });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar o pagamento." }, { status: 502 });
  }
}
