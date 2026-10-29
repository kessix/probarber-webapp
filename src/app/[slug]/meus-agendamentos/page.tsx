import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MyAppointments } from "@/components/booking/MyAppointments";
import "@/components/booking/booking.css";
import { getBarbershop } from "@/lib/barbershops";

type Props = { params: Promise<{ slug: string }> };

// Página pessoal do cliente: não deve aparecer em buscadores.
export const metadata: Metadata = { title: "Meus agendamentos", robots: { index: false, follow: false } };

export default function MyAppointmentsPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main className="bk">
          <div className="bk-wrap">
            <p className="bk-sub" style={{ textAlign: "center" }}>Carregando…</p>
          </div>
        </main>
      }>
      {params.then(({ slug }) => (
        <Shop slug={slug} />
      ))}
    </Suspense>
  );
}

async function Shop({ slug }: { slug: string }) {
  const shop = await getBarbershop(slug);
  if (!shop) notFound();
  return <MyAppointments shop={shop} />;
}
