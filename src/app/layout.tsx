import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Pushlabs Production OS",
  description: "Internal production & business OS for Pushlabs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex bg-graphite-50">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="mx-auto w-full max-w-7xl p-6 md:p-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
