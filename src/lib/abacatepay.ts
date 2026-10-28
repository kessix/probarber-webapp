import "server-only";

/**
 * Cliente mínimo da AbacatePay (Pix via Checkout Transparente).
 * A chave de API só existe no servidor: nunca importe este arquivo em componente de cliente.
 * O ambiente (teste ou real) é definido pela chave: abc_dev_ simula, abc_prod_ cobra de verdade.
 */
const BASE_URL = "https://api.abacatepay.com/v2";

export type PixStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "UNDER_DISPUTE" | "REFUNDED" | "REDEEMED" | "APPROVED" | "FAILED";

export type PixCharge = {
  id: string;
  amount: number;
  status: PixStatus;
  devMode: boolean;
  /** Copia e cola */
  brCode: string;
  /** Imagem do QR Code (data URI PNG) */
  brCodeBase64: string;
  expiresAt: string;
};

function apiKey() {
  const key = process.env.ABACATEPAY_API_KEY;
  if (!key) throw new Error("Defina ABACATEPAY_API_KEY em .env.local (veja .env.example).");
  return key;
}

export const isDevMode = () => apiKey().startsWith("abc_dev_");

/** Ids de cobrança Pix têm este formato. Valide antes de montar URLs com ele. */
export const isPixId = (id: string) => /^pix_char_[A-Za-z0-9]+$/.test(id);

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
  });
  const body = (await res.json().catch(() => null)) as { success?: boolean; data?: T; error?: string } | null;
  if (!res.ok || !body?.success || !body.data) {
    // Mensagem completa só no log do servidor; o cliente recebe um erro genérico.
    console.error("AbacatePay", path, res.status, body?.error);
    throw new Error("Falha ao falar com o provedor de pagamento.");
  }
  return body.data;
}

export function createPixCharge(input: { amountCents: number; description: string; metadata?: Record<string, string> }) {
  return call<PixCharge>("/transparents/create", {
    method: "POST",
    body: JSON.stringify({
      method: "PIX",
      data: { amount: input.amountCents, description: input.description, expiresIn: 1800, metadata: input.metadata },
    }),
  });
}

export function checkPixCharge(id: string) {
  return call<{ id: string; status: PixStatus; expiresAt: string }>(`/transparents/check?id=${encodeURIComponent(id)}`);
}

/** Só funciona com chave de teste. */
export function simulatePixPayment(id: string) {
  return call<PixCharge>(`/transparents/simulate-payment?id=${encodeURIComponent(id)}`, { method: "POST" });
}
