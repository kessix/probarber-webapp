"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, Scissors } from "lucide-react";

/** Fade-in on scroll. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("visible"); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/** Toggles body dark mode while the wrapped section is on screen. */
export function DarkZone({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => document.body.classList.toggle("dark-mode", e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); document.body.classList.remove("dark-mode"); };
  }, []);
  return <section ref={ref} id={id} className={className}>{children}</section>;
}

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <a href="#" className="logo"><span className="logo-mark"><Scissors size={18} /></span>ProBarber</a>
        <nav className="nav-links" aria-label="Principal">
          <a href="#recursos">Recursos</a>
          <a href="#depoimentos">Depoimentos</a>
          <a href="#precos">Preço</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <a href="#precos" id="nav-cta" className="btn btn-primary nav-cta">Teste grátis</a>
      </div>
    </header>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {items.map((it, i) => (
        <div key={it.q} className={`faq-item ${open === i ? "open" : ""}`}>
          <button id={`faq-btn-${i}`} className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {it.q}<Plus className="faq-icon" size={22} />
          </button>
          <div className="faq-a"><div><p>{it.a}</p></div></div>
        </div>
      ))}
    </div>
  );
}

/** Live-ish counters, like a growing social proof. */
export function Metrics({ items }: { items: { base: number; perDay: number; label: string }[] }) {
  const start = new Date("2025-01-01").getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, []);
  const fmt = (v: number) =>
    v >= 1e6 ? (v / 1e6).toFixed(2).replace(/\.?0+$/, "") + " mi" : v >= 1e3 ? (v / 1e3).toFixed(1).replace(".0", "") + " mil" : v.toFixed(0);
  return (
    <div className="container metrics">
      {items.map((m) => (
        <div key={m.label}>
          <h4>+{fmt(m.base + (now ? ((now - start) / 86400000) * m.perDay : 0))}</h4>
          <p>{m.label}</p>
        </div>
      ))}
    </div>
  );
}
