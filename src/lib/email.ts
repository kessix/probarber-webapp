import "server-only";

/**
 * Envio de e-mails pelo Resend. Só roda no servidor.
 * O remetente precisa estar em um domínio verificado no Resend; troque com EMAIL_FROM se precisar.
 */
const FROM = process.env.EMAIL_FROM ?? "ProBarber <no-reply@probarberapp.com.br>";

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Defina RESEND_API_KEY em .env.local (veja .env.example).");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [input.to], subject: input.subject, html: input.html }),
  });
  if (!res.ok) {
    // O motivo detalhado fica só no log do servidor.
    console.error("Resend", res.status, await res.text().catch(() => ""));
    throw new Error("Falha ao enviar o e-mail.");
  }
}

/** Texto vindo do cliente ou do barbeiro nunca entra no HTML sem passar por aqui. */
export const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
