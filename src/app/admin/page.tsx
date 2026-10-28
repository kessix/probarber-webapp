import type { Metadata } from "next";
import { Scissors } from "lucide-react";

export const metadata: Metadata = {
  title: "Painel do barbeiro · ProBarber",
  robots: { index: false },
};

// Rota reservada para o painel do barbeiro. Ainda não implementado.
export default function AdminPage() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div>
        <span className="logo-mark" style={{ margin: "0 auto 16px" }}><Scissors size={18} /></span>
        <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>Painel do barbeiro</h1>
        <p style={{ color: "var(--muted)" }}>Em breve. Por enquanto, gerencie sua agenda pelo app ProBarber.</p>
      </div>
    </main>
  );
}
