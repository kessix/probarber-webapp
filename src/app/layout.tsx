import type { Metadata } from "next";
import { Lexend, Playfair_Display } from "next/font/google";
import "./globals.css";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "ProBarber: Agenda e gestão para barbearias",
  description:
    "O ProBarber é o app ideal para sua barbearia. Agendamento online, gestão de equipe e controle financeiro em um só lugar.",
  keywords: ["agenda para barbeiros", "app de barbearia", "agendamento online", "ProBarber", "gestão de barbearia"],
  openGraph: {
    title: "ProBarber: Agenda e gestão para barbearias",
    description: "Agendamento online, gestão de equipe e controle financeiro em um só lugar.",
    type: "website",
    locale: "pt_BR",
    siteName: "ProBarber",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${lexend.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
