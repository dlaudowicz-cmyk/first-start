import { getActiveProject, getModules, getWorkshopDays, getTools } from "@/lib/data";
import { buildMarkdownExport } from "@/lib/export";

export async function GET() {
  const project = await getActiveProject();
  if (!project) return new Response("Kein Projekt gefunden", { status: 404 });

  const [modules, days, toolList] = await Promise.all([
    getModules(project.id),
    getWorkshopDays(project.id),
    getTools(),
  ]);

  const markdown = buildMarkdownExport(project, modules, days, toolList);

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="curriculum-${project.id}.md"`,
    },
  });
}
