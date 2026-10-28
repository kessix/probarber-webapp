import { NextResponse } from "next/server";
import { checkPixCharge, isPixId } from "@/lib/abacatepay";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Status de uma cobrança Pix. Quando a AbacatePay confirma o pagamento, este é o ponto em que o
 * servidor marca o agendamento como pago. A operação é idempotente: repetir não muda nada.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isPixId(id)) return NextResponse.json({ error: "Cobrança inválida." }, { status: 400 });

  try {
    const { status, expiresAt } = await checkPixCharge(id);

    if (status === "PAID") {
      const { error } = await supabaseAdmin()
        .from("appointments")
        .update({ payment_status: "pago", payment_method: "pix", payment_online: true })
        .eq("pix_charge_id", id)
        .neq("payment_status", "pago");
      // Se não conseguiu gravar, não diz "pago": a página tenta de novo no próximo ciclo.
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ status, expiresAt });
  } catch (err) {
    console.error("pix: consulta", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Não foi possível consultar o pagamento." }, { status: 502 });
  }
}
