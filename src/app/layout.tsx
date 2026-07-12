import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Creator Curriculum App",
  description: "Curriculum-Werkzeug für die AI Creator – Professional Certificate Weiterbildung (FAM)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background text-foreground">
        <div className="bg-mesh no-print" aria-hidden="true">
          <span className="blob" />
        </div>
        <Sidebar />
        <main className="relative z-10 flex-1 min-w-0">{children}</main>
      </body>
    </html>
  );
}
