import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";
import "@/components/booking/booking.css";
import { getBarbershop } from "@/lib/barbershops";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getBarbershop(slug);
  if (!shop) return { title: "Barbearia não encontrada", robots: { index: false } };
  return {
    title: `${shop.name}: agende seu horário`,
    description: `Agende online na ${shop.name}. Escolha o serviço, o dia e o horário em segundos.`,
  };
}

// Barbearias vêm do banco: o endereço só é conhecido na hora do acesso, então lê dentro do Suspense.
export default function BarbershopPage({ params }: Props) {
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
  return <BookingFlow shop={shop} />;
}
