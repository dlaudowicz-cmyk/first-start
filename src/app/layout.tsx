import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

/** Grotesk für alles, Mono für Zahlen und technische Angaben — dieselbe
 *  Paarung wie im Produktionsboard, damit App und Bericht zusammengehören. */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pushlabs Company OS",
  description: "Internes Betriebssystem für Produktion und Wirtschaftlichkeit bei Pushlabs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="bg-ground text-ink">
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="mx-auto w-full max-w-7xl p-6 md:p-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
