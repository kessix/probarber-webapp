import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY em .env.local (veja .env.example).",
  );
}

/**
 * Cliente com a chave pública (publishable). O acesso aos dados é limitado pelas
 * regras RLS do banco. Para login do barbeiro no /admin, migrar para @supabase/ssr.
 */
export const supabase = createClient(url, key, { auth: { persistSession: false } });
