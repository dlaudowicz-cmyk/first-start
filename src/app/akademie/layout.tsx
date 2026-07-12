import { AcademySidebar } from "@/components/academy/academy-sidebar";
import { getAcademyRole } from "@/lib/academy-role";

export default async function AcademyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = await getAcademyRole();

  return (
    <div className="flex flex-1 min-h-full">
      <AcademySidebar role={role} />
      <main className="relative z-10 flex-1 min-w-0">{children}</main>
    </div>
  );
}
