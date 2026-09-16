"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

type StepInput = {
  title: string;
  instructions: string | null;
};

function readSteps(formData: FormData): StepInput[] {
  const raw = String(formData.get("steps") ?? "[]");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Could not read workflow steps.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Workflow steps are required.");
  }

  const steps = parsed
    .map((step) => {
      if (!step || typeof step !== "object") return null;
      const record = step as { title?: unknown; instructions?: unknown };
      const title = String(record.title ?? "").trim();
      if (!title) return null;
      const instructions = String(record.instructions ?? "").trim() || null;
      return { title, instructions };
    })
    .filter((step): step is StepInput => Boolean(step));

  if (steps.length === 0) {
    throw new Error("Add at least one step.");
  }

  return steps;
}

export async function createTemplate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Template name is required.");
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const steps = readSteps(formData);

  const template = await prisma.workflowTemplate.create({
    data: {
      name,
      description,
      steps: {
        create: steps.map((step, order) => ({
          ...step,
          order,
        })),
      },
    },
  });

  revalidatePath("/templates");
  revalidatePath("/");
  redirect(`/templates/${template.id}`);
}

export async function updateTemplate(templateId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Template name is required.");
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const steps = readSteps(formData);

  await prisma.$transaction([
    prisma.workflowTemplateStep.deleteMany({ where: { templateId } }),
    prisma.workflowTemplate.update({
      where: { id: templateId },
      data: {
        name,
        description,
        steps: {
          create: steps.map((step, order) => ({
            ...step,
            order,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/templates");
  revalidatePath(`/templates/${templateId}`);
  redirect(`/templates/${templateId}`);
}

export async function deleteTemplate(templateId: string) {
  const count = await prisma.workflowInstance.count({ where: { templateId } });
  if (count > 0) {
    throw new Error("This template has workflow instances and cannot be deleted.");
  }

  await prisma.workflowTemplate.delete({ where: { id: templateId } });
  revalidatePath("/templates");
  revalidatePath("/");
  redirect("/templates");
}
