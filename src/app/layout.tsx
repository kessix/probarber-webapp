import type { Metadata } from "next";
import { Lexend, Playfair_Display } from "next/font/google";
import "./globals.css";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "ProBarber App: Agenda e gestão para barbearias",
  description:
    "O ProBarber App é o aplicativo para a sua barbearia: agenda online, link de agendamento próprio e pagamento por Pix ou na barbearia.",
  keywords: ["agenda para barbeiros", "app de barbearia", "agendamento online", "ProBarber", "ProBarber App", "gestão de barbearia"],
  openGraph: {
    title: "ProBarber App: Agenda e gestão para barbearias",
    description: "Agenda online, link de agendamento próprio e pagamento por Pix ou na barbearia.",
    type: "website",
    locale: "pt_BR",
    siteName: "ProBarber App",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${lexend.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
