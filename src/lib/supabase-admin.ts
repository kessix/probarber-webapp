import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a chave SECRETA do Supabase: ignora as regras de acesso (RLS).
 * Só roda no servidor (rotas /api) e só para o que o visitante não pode fazer sozinho,
 * como confirmar um pagamento. Nunca importe em componente de cliente.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_SUPABASE_SECRET_KEY (veja .env.example).");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
