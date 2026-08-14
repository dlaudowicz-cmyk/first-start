"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { projectSchema } from "@/lib/schemas";

function parse(formData: FormData) {
  return {
    title: String(formData.get("title") || "").trim(),
    clientId: String(formData.get("clientId") || ""),
    type: String(formData.get("type") || "image film") as never,
    status: String(formData.get("status") || "lead") as never,
    shootStart: String(formData.get("shootStart") || ""),
    shootEnd: String(formData.get("shootEnd") || ""),
    location: String(formData.get("location") || ""),
    budget: formData.get("budget") ? Number(formData.get("budget")) : undefined,
    notes: String(formData.get("notes") || ""),
    ventureId: String(formData.get("ventureId") || ""),
    pipelineKey: String(formData.get("pipelineKey") || ""),
  };
}

function toDate(s?: string) {
  return s ? new Date(s) : null;
}

export async function createProject(formData: FormData) {
  const data = projectSchema.parse(parse(formData));
  const created = await prisma.project.create({
    data: {
      title: data.title,
      clientId: data.clientId,
      type: data.type,
      status: data.status,
      shootStart: toDate(data.shootStart || undefined),
      shootEnd: toDate(data.shootEnd || undefined),
      location: data.location || null,
      budget: data.budget ?? null,
      notes: data.notes || null,
      ventureId: data.ventureId || null,
      pipelineKey: data.pipelineKey || null,
    },
  });
  revalidatePath("/projects");
  redirect(`/projects/${created.id}`);
}

export async function updateProject(id: string, formData: FormData) {
  const data = projectSchema.parse(parse(formData));
  await prisma.project.update({
    where: { id },
    data: {
      title: data.title,
      clientId: data.clientId,
      type: data.type,
      status: data.status,
      shootStart: toDate(data.shootStart || undefined),
      shootEnd: toDate(data.shootEnd || undefined),
      location: data.location || null,
      budget: data.budget ?? null,
      notes: data.notes || null,
      ventureId: data.ventureId || null,
      pipelineKey: data.pipelineKey || null,
    },
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  redirect("/projects");
}
