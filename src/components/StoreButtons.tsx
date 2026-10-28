import { Download } from "lucide-react";
import { STORE_LINKS } from "@/lib/stores";

const stores = [
  { id: "android", label: "Disponível no", name: "Google Play", href: STORE_LINKS.android },
  { id: "ios", label: "Baixe na", name: "App Store", href: STORE_LINKS.ios },
] as const;

/** Botões de download do app. `idPrefix` mantém ids únicos quando aparece mais de uma vez. */
export function StoreButtons({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="store-row">
      {stores.map((s) => (
        <a key={s.id} id={`${idPrefix}-${s.id}`} href={s.href} className="store-btn">
          <Download size={22} strokeWidth={1.6} />
          <span><small>{s.label}</small><strong>{s.name}</strong></span>
        </a>
      ))}
    </div>
  );
}
