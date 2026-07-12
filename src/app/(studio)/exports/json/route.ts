import { getActiveProject, getModules, getWorkshopDays, getTools } from "@/lib/data";
import { buildJsonExport } from "@/lib/export";

export async function GET() {
  const project = await getActiveProject();
  if (!project) return new Response("Kein Projekt gefunden", { status: 404 });

  const [modules, days, toolList] = await Promise.all([
    getModules(project.id),
    getWorkshopDays(project.id),
    getTools(),
  ]);

  const json = buildJsonExport(project, modules, days, toolList);

  return new Response(JSON.stringify(json, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="curriculum-${project.id}.json"`,
    },
  });
}
