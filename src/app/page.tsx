import { BellRing, Boxes, CalendarCheck, CalendarClock, CalendarDays, CreditCard, Download, Headset, Link2, Mail, Scissors, SlidersHorizontal, Store, UserX, UsersRound, Wallet, type LucideIcon } from "lucide-react";
import { DarkZone, Faq, NavBar, Reveal } from "@/components/Interactive";
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
  { icon: CalendarDays, title: ["Agenda online que", "seus clientes usam sozinhos"] },
  { icon: CreditCard, title: ["Cliente paga na hora", "com Pix"] },
  { icon: Store, title: ["Ou paga na barbearia,", "com baixa em Pix, dinheiro ou cartão"] },
  { icon: SlidersHorizontal, title: ["Você escolhe", "como cobrar"] },
];

type Feature = { i: LucideIcon; t: string; d: string; soon?: boolean };
const features: Feature[] = [
  { i: Link2, t: "Link de agendamento próprio", d: "Seu endereço, sua logo e seus contatos: Instagram, Facebook e avaliações do Google. O cliente agenda em segundos, sem criar conta." },
  { i: CalendarClock, t: "Horários sob medida", d: "Defina dias, início, almoço e fim, o intervalo entre horários e até quantos dias a agenda fica aberta (até 14). Feche um dia inteiro ou só algumas horas." },
  { i: Scissors, t: "Catálogo de serviços", d: "Serviços com foto, duração e preço, inclusive preço diferente por dia da semana. Escolha quais você atende." },
  { i: Wallet, t: "Pix ou pagar na barbearia", d: "Pagamento obrigatório, opcional ou nenhum. Quem paga no local vira pendência e você dá baixa em Pix, dinheiro ou cartão." },
  { i: CalendarCheck, t: "Meus agendamentos", d: "O cliente vê e cancela o próprio horário (até 2 horas antes) sem login, e o link lembra dos dados dele na próxima vez." },
  { i: Mail, t: "Confirmação por e-mail", d: "O cliente recebe a confirmação do horário com endereço e valor, e só se aceitar receber." },
  { i: UserX, t: "Controle de clientes", d: "Bloqueie quem falta ou atrapalha, veja os cancelados e acompanhe as pendências de pagamento direto na agenda." },
  { i: BellRing, t: "Lembretes automáticos", d: "Lembretes antes do horário para reduzir faltas e manter sua agenda cheia.", soon: true },
  { i: UsersRound, t: "Gestão de equipe", d: "Cada barbeiro com sua agenda, comissões e histórico de atendimentos.", soon: true },
  { i: Boxes, t: "Controle de estoque", d: "Entradas e saídas de pomadas, lâminas e produtos, com alerta quando algo estiver acabando.", soon: true },
  { i: Wallet, t: "Controle financeiro", d: "Entradas, saídas e faturamento por dia, serviço ou profissional, com relatórios claros.", soon: true },
  { i: Headset, t: "Suporte humanizado", d: "Fale com gente de verdade por chat ou WhatsApp, sem robôs e sem filas.", soon: true },
];

const howItWorks: { i: LucideIcon; t: string; d: string }[] = [
  { i: Download, t: "Baixe o app e crie sua conta", d: "O cadastro é feito pelo aplicativo, com um código enviado ao seu e-mail. Sem senha para decorar." },
  { i: Link2, t: "Configure e divulgue seu link", d: "Escolha o endereço, ajuste horários e serviços e coloque o link na bio do Instagram ou no WhatsApp." },
  { i: CalendarCheck, t: "O cliente agenda e paga", d: "Ele escolhe serviço, dia e horário e paga por Pix na hora ou na barbearia, como você configurou." },
];

const facts = [
  { n: "14", l: "dias de agenda aberta, no máximo" },
  { n: "3", l: "formas de cobrar: comum, Pix obrigatório ou opcional" },
  { n: "0", l: "contas para o seu cliente criar" },
  { n: "30", l: "dias de teste grátis" },
];

const faq = [
  { q: "Como funciona o aplicativo ProBarber?", a: "O ProBarber reúne a agenda online, o link de agendamento da sua barbearia e o recebimento por Pix ou na barbearia em um só lugar. Equipe, estoque e financeiro estão a caminho." },
  { q: "Como faço meu cadastro?", a: "O cadastro é feito somente pelo aplicativo ProBarber, disponível no Google Play e na App Store. Baixe o app, crie sua conta e comece o teste grátis." },
  { q: "Preciso pagar para usar o ProBarber?", a: `Você tem 30 dias de teste grátis, sem compromisso. Depois, o plano custa R$ ${PRICE.whole},${PRICE.cents} por mês por profissional cadastrado.` },
  { q: "Como funciona o pagamento dos clientes?", a: "Você escolhe: agendamento comum (sem pagamento no app), Pix obrigatório ou Pix opcional. No opcional, o cliente paga na hora ou na barbearia; quem paga no local fica como pendência e você dá baixa em Pix, dinheiro ou cartão." },
  { q: "Quais são os benefícios do agendamento online?", a: "Menos faltas, agenda organizada e uma experiência moderna para seus clientes, com confirmação por e-mail e a opção de cancelar pelo próprio link." },
  { q: "É seguro usar o ProBarber?", a: "Sim. Usamos criptografia e servidores seguros para proteger os dados dos seus clientes e o histórico de agendamentos." },
  { q: "O sistema é fácil de usar?", a: "Foi pensado para ser simples desde o primeiro acesso: telas claras, atalhos inteligentes e suporte quando precisar." },
  { q: "Posso personalizar com a marca da minha barbearia?", a: "Sim! Personalize o link de agendamento com o nome do seu negócio e divulgue no Instagram ou WhatsApp." },
  { q: "O ProBarber tem suporte?", a: "Com certeza. Nosso suporte é humanizado e rápido, por chat ou WhatsApp." },
  { q: "Preciso de internet para usar?", a: "Sim. A conexão mantém tudo sincronizado e disponível de qualquer lugar." },
];


export default function Home() {
  return (
    <>
      <NavBar />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Gestão para barbearias</p>
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
              <ul className="hero-points">
                <li>30 dias de teste grátis</li>
                <li>Pix ou pagamento na barbearia</li>
                <li>Cliente agenda sem criar conta</li>
              </ul>
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
          <Reveal><p className="eyebrow">Principais recursos</p><h2>Agenda com pagamento <em>flexível</em>: Pix ou na barbearia</h2></Reveal>
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
                  <article className={`feature ${f.soon ? "is-soon" : ""}`}>{f.soon ? <span className="soon">Em breve</span> : null}<div className="fi"><f.i size={24} strokeWidth={1.6} /></div><h4>{f.t}</h4><p>{f.d}</p></article>
                </Reveal>
              ))}
            </div>
          </div>
        </DarkZone>

        <DarkZone id="como-funciona" className="section features">
          <div className="container">
            <Reveal><p className="eyebrow">Como funciona</p><h2>Do download ao primeiro <em>agendamento</em></h2></Reveal>
            <div className="feature-grid">
              {howItWorks.map((f, i) => (
                <Reveal key={f.t} delay={i * 100}>
                  <article className="feature"><div className="fi"><f.i size={24} strokeWidth={1.6} /></div><h4>{f.t}</h4><p>{f.d}</p></article>
                </Reveal>
              ))}
            </div>
            <div className="metrics">
              {facts.map((f) => (
                <div key={f.l}><h4>{f.n}</h4><p>{f.l}</p></div>
              ))}
            </div>
          </div>
        </DarkZone>

        <section id="precos" className="section container">
          <Reveal>
            <div className="pricing-box">
              <div className="pricing-left">
                <h2>Quais são os planos?</h2>
                <p>Hoje oferecemos <span className="hl">30 dias</span> de teste sem compromisso.</p>
                <ul className="perks"><li>Agenda e link de agendamento próprio</li><li>Pix ou pagamento na barbearia</li><li>Cadastro pelo app, sem burocracia</li></ul>
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
              <div className="logo"><span className="logo-mark"><Scissors size={18} /></span><span>ProBarber<span className="logo-app">App</span></span></div>
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
