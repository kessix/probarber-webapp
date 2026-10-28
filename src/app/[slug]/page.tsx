import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { BARBERSHOPS, getBarbershop } from "@/lib/barbershops";

type Props = { params: Promise<{ slug: string }> };

// Barbearias conhecidas são pré-renderizadas; as demais caem no 404.
export function generateStaticParams() {
  return BARBERSHOPS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = getBarbershop(slug);
  if (!shop) return {};
  return {
    title: `${shop.name}: agende seu horário`,
    description: `Agende online na ${shop.name}. Escolha o serviço, o dia e o horário em segundos.`,
  };
}

export default async function BarbershopPage({ params }: Props) {
  const { slug } = await params;
  const shop = getBarbershop(slug);
  if (!shop) notFound();
  return <BookingFlow shop={shop} />;
}
