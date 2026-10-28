import { Boxes, CalendarCheck, CalendarDays, CreditCard, Link2, Scissors, Share2, Star, UsersRound, Wallet, BellRing, Headset, type LucideIcon } from "lucide-react";
import { DarkZone, Faq, Metrics, NavBar, Reveal } from "@/components/Interactive";
import { StepScreen } from "@/components/PhoneScreens";
import { StoreButtons } from "@/components/StoreButtons";
import { STORE_LINKS } from "@/lib/stores";

const YEAR = 2026;
const PRICE = { whole: "40", cents: "00" };

const bubbles = [
  { n: "Lucas", t: "10:00", c: "#b97d27", x: "-6%", y: "10%", dx: "14px", dy: "-18px", dur: "9s", delay: "0s" },
  { n: "Rafa", t: "14:00", c: "#3f6b5a", x: "74%", y: "4%", dx: "-16px", dy: "14px", dur: "11s", delay: "-3s" },
  { n: "Caio", t: "10:30", c: "#6a4c93", x: "-4%", y: "72%", dx: "12px", dy: "16px", dur: "10s", delay: "-6s" },
  { n: "Davi", t: "09:00", c: "#a8442f", x: "78%", y: "58%", dx: "-12px", dy: "-16px", dur: "12s", delay: "-2s" },
];

const steps: { icon: LucideIcon; title: string[] }[] = [
  { icon: CalendarDays, title: ["Acompanhe", "seus agendamentos"] },
  { icon: CreditCard, title: ["Cliente paga", "direto pelo app com Pix"] },
  { icon: Link2, title: ["Personalize seu link", "de agendamento"] },
  { icon: Share2, title: ["Integre seu link com", "suas redes sociais"] },
];

const features: { i: LucideIcon; t: string; d: string }[] = [
  { i: CalendarCheck, t: "Agendamento online", d: "Seus clientes marcam horário a qualquer hora, em segundos. Menos mensagens no WhatsApp, mais tempo na cadeira." },
  { i: Boxes, t: "Controle de estoque", d: "Registre entradas e saídas de pomadas, lâminas e produtos, e receba alertas quando algo estiver acabando." },
  { i: UsersRound, t: "Gestão de equipe", d: "Cada barbeiro com sua agenda, comissões e histórico de atendimentos, tudo organizado em um só lugar." },
  { i: Headset, t: "Suporte humanizado", d: "Fale com gente de verdade por chat ou WhatsApp. Sem robôs, sem filas e sem enrolação." },
  { i: Wallet, t: "Controle financeiro", d: "Acompanhe entradas, saídas e faturamento por dia, serviço ou profissional, com pagamentos via Pix e relatórios claros." },
  { i: BellRing, t: "Automação de lembretes", d: "Confirmações e lembretes automáticos que reduzem faltas e mantêm sua agenda cheia." },
];

const Stars = () => (
  <span className="stars" aria-label="5 estrelas">
    {[0, 1, 2, 3, 4].map((n) => <Star key={n} size={14} fill="currentColor" />)}
  </span>
);

const testimonials = [
  { n: "João Pedro", s: "Barbearia Dois Irmãos", c: "#b97d27", q: "Antes eu anotava horário no papel e esquecia metade. Agora é tudo automático e meus clientes adoram a praticidade." },
  { n: "Lucas Andrade", s: "Studio do Barba", c: "#3f6b5a", q: "Dobrei meus agendamentos depois que comecei a usar o app. E o suporte é nota 10." },
  { n: "Matheus Lopes", s: "Barbearia Elite", c: "#6a4c93", q: "O controle financeiro me mostra exatamente quanto faturo no mês. Muito intuitivo." },
  { n: "Anderson Silva", s: "Barber 013", c: "#a8442f", q: "Os lembretes automáticos reduziram minhas faltas em 70%. Cliente esquecer virou raridade." },
  { n: "Felipe Rezende", s: "Barbearia Central", c: "#2f6f8f", q: "Tenho 3 profissionais e cada um tem sua agenda separada. Organizou a casa toda." },
  { n: "Rafael Teixeira", s: "Barbearia Refúgio", c: "#8f6a2f", q: "Comecei no teste grátis e nunca mais saí. App leve, bonito e prático." },
];

const faq = [
  { q: "Como funciona o aplicativo ProBarber?", a: "O ProBarber reúne agendamentos, equipe, estoque e pagamentos em um só lugar, direto pelo celular ou computador." },
  { q: "Como faço meu cadastro?", a: "O cadastro é feito somente pelo aplicativo ProBarber, disponível no Google Play e na App Store. Baixe o app, crie sua conta e comece o teste grátis." },
  { q: "Preciso pagar para usar o ProBarber?", a: `Você tem 30 dias de teste grátis, sem compromisso. Depois, o plano custa R$ ${PRICE.whole},${PRICE.cents} por mês por profissional cadastrado.` },
  { q: "Quais são os benefícios do agendamento online?", a: "Menos faltas, agenda organizada e uma experiência moderna para seus clientes, com confirmação automática e lembretes." },
  { q: "É seguro usar o ProBarber?", a: "Sim. Usamos criptografia e servidores seguros para proteger os dados dos seus clientes e o histórico de agendamentos." },
  { q: "O sistema é fácil de usar?", a: "Foi pensado para ser simples desde o primeiro acesso: telas claras, atalhos inteligentes e suporte quando precisar." },
  { q: "Posso personalizar com a marca da minha barbearia?", a: "Sim! Personalize o link de agendamento com o nome do seu negócio e divulgue no Instagram ou WhatsApp." },
  { q: "O ProBarber tem suporte?", a: "Com certeza. Nosso suporte é humanizado e rápido, por chat ou WhatsApp." },
  { q: "Preciso de internet para usar?", a: "Sim. A conexão mantém tudo sincronizado e disponível de qualquer lugar." },
];

const initials = ["JP", "LA", "ML", "AS"];
const avatarColors = ["#b97d27", "#3f6b5a", "#6a4c93", "#a8442f"];

export default function Home() {
  const loop = [...testimonials, ...testimonials];
  return (
    <>
      <NavBar />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Gestão para barbearias · Desde 2025</p>
              <h1>Simplifique a forma como você <span>administra sua barbearia</span></h1>
              <p className="lead">Não importa o tamanho do seu negócio, o ProBarber foi feito para aumentar sua produtividade e liberar você para o que importa: crescer e prosperar.</p>
              <div id="baixar" className="download-box">
                <p className="download-title">Baixe o app ProBarber para Android e iPhone</p>
                <StoreButtons idPrefix="hero" />
                <p className="download-note">O cadastro é feito somente pelo aplicativo. Baixe, crie sua conta e comece os 30 dias de teste grátis.</p>
              </div>
              <div className="hero-actions">
                <a id="hero-more" href="#recursos" className="btn btn-ghost">Ver recursos</a>
              </div>
              <div className="rating">
                <div className="avatars" aria-hidden="true">
                  {initials.map((s, i) => <span key={s} className="avatar" style={{ background: avatarColors[i] }}>{s}</span>)}
                </div>
                <div>
                  <strong>4.8 <Stars /></strong>
                  <small>+800 avaliações · 60k+ downloads</small>
                </div>
              </div>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-photo"><img src="/barbershop.jpg" alt="" /></div>
              <div className="phone">
                <div className="screen">
                  <h5>Agenda de hoje</h5>
                  <p className="sub">Sexta, 24 de outubro</p>
                  <div className="days">
                    {[["S", 22], ["T", 23], ["Q", 24], ["Q", 25], ["S", 26]].map(([d, n], i) => (
                      <div key={i} className={`day ${i === 2 ? "active" : ""}`}>{d}<b>{n}</b></div>
                    ))}
                  </div>
                  {[["09:00", "Davi · Corte + barba", "R$ 70", true], ["10:00", "Lucas · Degradê", "R$ 45", true], ["10:30", "Caio · Barba", "R$ 35", false], ["14:00", "Rafa · Corte", "R$ 45", false], ["15:30", "Livre", "", false]].map(([h, n, p, ok]) => (
                    <div key={String(h)} className={`slot ${ok ? "confirmed" : ""}`}>
                      <span className="time">{h}</span><span className="dot" />{n}<em>{p}</em>
                    </div>
                  ))}
                </div>
              </div>
              {bubbles.map((b) => (
                <div key={b.n} className="bubble" style={{ left: b.x, top: b.y, ["--dx" as string]: b.dx, ["--dy" as string]: b.dy, ["--dur" as string]: b.dur, ["--delay" as string]: b.delay }}>
                  <span className="avatar" style={{ background: b.c }}>{b.n[0]}</span>
                  <span>{b.n}<small>agendou {b.t}</small></span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="pole" aria-hidden="true" />

        <section id="recursos" className="section container">
          <Reveal><p className="eyebrow">Recursos</p><h2>Todas as ferramentas para o seu negócio <em>na palma da mão</em></h2></Reveal>
          <div className="steps">
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="step">
                  <span className="num">0{i + 1}</span><span className="icon"><s.icon size={30} strokeWidth={1.4} /></span>
                  <StepScreen index={i} />
                  <h3>{s.title[0]}<br />{s.title[1]}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="statement">
          <Reveal className="container">
            <p className="statement-title"><span>Deixe para trás a luta constante contra o tempo</span><span>e descubra a revolução na sua rotina com o <b>ProBarber</b>.</span></p>
          </Reveal>
        </section>

        <DarkZone className="section features">
          <div className="container">
            <Reveal><p className="eyebrow">Funcionalidades</p><h2>Tudo que sua barbearia <em>precisa</em></h2></Reveal>
            <div className="feature-grid">
              {features.map((f, i) => (
                <Reveal key={f.t} delay={(i % 3) * 100}>
                  <article className="feature"><div className="fi"><f.i size={24} strokeWidth={1.6} /></div><h4>{f.t}</h4><p>{f.d}</p></article>
                </Reveal>
              ))}
            </div>
          </div>
        </DarkZone>

        <DarkZone id="depoimentos" className="section testimonials">
          <div className="container"><Reveal><p className="eyebrow">Depoimentos</p><h2>Veja o que nossos <em>parceiros</em> falam sobre nós</h2></Reveal></div>
          <div className="slider">
            <div className="track">
              {loop.map((t, i) => (
                <figure key={i} className="t-item">
                  <div className="t-stars"><Stars /> <span>5.0</span></div>
                  <p>{t.q}</p>
                  <figcaption className="author">
                    <span className="avatar" style={{ background: t.c }}>{t.n[0]}</span>
                    <div><strong>{t.n}</strong><small>{t.s}</small></div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <Metrics items={[
            { base: 120000, perDay: 400, label: "Agendamentos realizados" },
            { base: 900, perDay: 2, label: "Barbearias automatizadas" },
            { base: 14000, perDay: 20, label: "Horas poupadas" },
            { base: 480000, perDay: 1200, label: "Lembretes enviados" },
          ]} />
        </DarkZone>

        <section id="precos" className="section container">
          <Reveal>
            <div className="pricing-box">
              <div className="pricing-left">
                <h2>Quais são os planos?</h2>
                <p>Hoje oferecemos <span className="hl">30 dias</span> de teste sem compromisso.</p>
                <ul className="perks"><li>Agenda e link de agendamento</li><li>Equipe, estoque e financeiro</li><li>Suporte humanizado</li></ul>
              </div>
              <div className="pricing-right">
                <p>Depois do teste, se você gostar, o valor é apenas</p>
                <div className="price"><sup>R$</sup>{PRICE.whole},{PRICE.cents}<span>/mês</span></div>
                <small>por profissional cadastrado.</small>
                <a id="pricing-cta" href="#baixar" className="btn btn-primary" style={{ marginTop: 28, alignSelf: "flex-start" }}>Baixar o app →</a>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="duvidas" className="section container" style={{ paddingTop: 0 }}>
          <Reveal><p className="eyebrow">FAQ</p><h2>Perguntas <em>frequentes</em></h2></Reveal>
          <Faq items={faq} />
        </section>
      </main>

      <div className="pole" aria-hidden="true" />
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <div className="logo"><span className="logo-mark"><Scissors size={18} /></span>ProBarber</div>
              <p>Transforme a experiência dos seus clientes com nosso sistema de agendamento e gestão inteligente.</p>
            </div>
            <div>
              <p style={{ margin: 0 }}>Downloads</p>
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <a id="dl-android" href={STORE_LINKS.android} className="btn btn-ghost" style={{ borderColor: "rgba(212,162,76,.35)" }}>Google Play</a>
                <a id="dl-ios" href={STORE_LINKS.ios} className="btn btn-ghost" style={{ borderColor: "rgba(212,162,76,.35)" }}>App Store</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>ProBarber · Kessix Tech</span>
            <span>© {YEAR} ProBarber. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
