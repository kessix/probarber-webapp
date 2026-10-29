import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, MapPin, Phone, Scissors, Star } from "lucide-react";
import { socialUrl, type Barbershop } from "@/lib/barbershops";

/** Logo, nome, endereço e contatos da barbearia, no topo das páginas públicas. */
export function ShopHeader({ shop, showMyAppointments = false }: { shop: Barbershop; showMyAppointments?: boolean }) {
  const instagram = socialUrl("instagram", shop.instagram);
  const facebook = socialUrl("facebook", shop.facebook);
  const google = socialUrl("web", shop.googleReviewUrl);
  return (
    <header className="bk-head">
      {shop.logoUrl ? (
        <Image className="bk-logo-img" src={shop.logoUrl} alt={`Logo da ${shop.name}`} width={88} height={88} unoptimized priority />
      ) : (
        <span className="bk-logo"><Scissors size={22} /></span>
      )}
      <h1>{shop.name}</h1>
      {shop.address ? <p className="bk-meta"><MapPin size={13} /> {shop.address}</p> : null}
      <div className="bk-links">
        {shop.phone ? <a href={`tel:+55${shop.phone}`}><Phone size={13} /> Ligar</a> : null}
        {instagram ? <a href={instagram} target="_blank" rel="noopener noreferrer">Instagram</a> : null}
        {facebook ? <a href={facebook} target="_blank" rel="noopener noreferrer">Facebook</a> : null}
        {google ? <a href={google} target="_blank" rel="noopener noreferrer"><Star size={13} /> Avaliações</a> : null}
      </div>
      {showMyAppointments ? (
        <Link className="bk-mine" href={`/${shop.slug}/meus-agendamentos`}>
          <CalendarCheck size={14} /> Meus agendamentos
        </Link>
      ) : null}
    </header>
  );
}
