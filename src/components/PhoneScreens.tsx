import { Banknote, Check, CreditCard, QrCode, Store } from "lucide-react";
import type { ReactNode } from "react";

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="mini-phone" aria-hidden="true">
      <div className="mini-screen">{children}</div>
    </div>
  );
}

/** Decorative QR code: standard 21x21 version 1 layout with refined modules and crisp styling */
function QrMock() {
  const N = 21;
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  const cells: string[] = [];
  let seed = 42;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      const timing = (y === 6 || x === 6) && (x + y) % 2 === 0;
      if (timing || rnd() > 0.48) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`} transform={`translate(${ox} ${oy})`}>
      <rect width="7" height="7" fill="#0d0b09" rx="1.5" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" rx="1" />
      <rect x="2" y="2" width="3" height="3" fill="#0d0b09" rx="0.5" />
    </g>
  );
  return (
    <div className="ms-qr">
      <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} shapeRendering="crispEdges">
        <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#fff" rx="2" />
        <path d={cells.join("")} fill="#0d0b09" />
        {finder(0, 0)}{finder(N - 7, 0)}{finder(0, N - 7)}
      </svg>
    </div>
  );
}

/** 1. Acompanhe seus agendamentos */
function AgendaScreen() {
  const slots = [
    ["09:00", "Davi", "Corte + barba", true],
    ["10:00", "Lucas", "Degradê", true],
    ["10:30", "Caio", "Barba", false],
    ["14:00", "Rafa", "Corte", false],
  ] as const;
  return (
    <Phone>
      <h6>Agenda de hoje</h6>
      <p className="ms-sub">4 agendamentos confirmados</p>
      <div className="ms-days">
        {["S", "T", "Q", "Q", "S"].map((d, i) => <span key={i} className={i === 2 ? "on" : ""}>{d}<b>{22 + i}</b></span>)}
      </div>
      {slots.map(([h, n, s, ok]) => (
        <div key={h} className={`ms-row ${ok ? "ok" : ""}`}>
          <strong>{h}</strong>
          <span>{n}<small>{s}</small></span>
          {ok && <Check size={13} />}
        </div>
      ))}
    </Phone>
  );
}

/** 2. Cliente paga direto pelo app */
function PaymentScreen() {
  return (
    <Phone>
      <h6>Pagamento</h6>
      <p className="ms-sub">Corte + barba · Sex 10:00</p>
      <div className="ms-total"><small>Total</small><strong>R$ 50,00</strong></div>
      <div className="ms-tabs"><span className="on"><QrCode size={13} /> Pix agora</span><span><Store size={13} /> Na barbearia</span></div>
      <QrMock />
      <p className="ms-hint">Escaneie ou copie o código Pix</p>
      <div className="ms-btn">Copiar código</div>
    </Phone>
  );
}

/** 3. Cliente escolhe pagar na barbearia: vira pendência e o barbeiro dá baixa */
function ReceiveScreen() {
  return (
    <Phone>
      <h6>Pendências</h6>
      <p className="ms-sub">Pagamentos a receber na barbearia</p>
      <div className="ms-row">
        <strong>14:00</strong>
        <span>Rafa<small>Corte · R$ 45</small></span>
      </div>
      <p className="ms-hint">Receber como</p>
      <div className="ms-tabs"><span className="on"><QrCode size={12} /> Pix</span><span><Banknote size={12} /> Dinheiro</span><span><CreditCard size={12} /> Cartão</span></div>
      <div className="ms-row ok">
        <strong>10:00</strong>
        <span>Lucas<small>Pago · Cartão</small></span>
        <Check size={13} />
      </div>
      <div className="ms-btn">Dar baixa</div>
    </Phone>
  );
}

/** 4. O barbeiro escolhe como o cliente paga */
function ModesScreen() {
  const modes = [
    ["Agendamento comum", "Sem pagamento no app", false],
    ["Pix obrigatório", "Horário fecha ao pagar", false],
    ["Pix ou na barbearia", "O cliente escolhe", true],
  ] as const;
  return (
    <Phone>
      <h6>Como o cliente paga</h6>
      <p className="ms-sub">Você decide, a qualquer momento</p>
      {modes.map(([t, d, on]) => (
        <div key={t} className={`ms-opt ${on ? "on" : ""}`}>
          <i />
          <span>{t}<small>{d}</small></span>
        </div>
      ))}
      <p className="ms-hint">Pagamento online somente por Pix</p>
    </Phone>
  );
}

const screens = [AgendaScreen, PaymentScreen, ReceiveScreen, ModesScreen];

export function StepScreen({ index }: { index: number }) {
  const Screen = screens[index];
  return Screen ? <Screen /> : null;
}
