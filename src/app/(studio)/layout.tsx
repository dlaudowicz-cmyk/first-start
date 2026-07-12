import { Sidebar } from "@/components/sidebar";

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 min-h-full">
      <Sidebar />
      <main className="relative z-10 flex-1 min-w-0">{children}</main>
    </div>
  );
}
