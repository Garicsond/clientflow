"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { STEP_STATUSES, type StepStatusValue } from "@/lib/constants";
import { parseDateInput } from "@/lib/utils";

function revalidateWorkflow(clientId: string, instanceId: string) {
  revalidatePath("/");
  revalidatePath("/workflows");
  revalidatePath(`/workflows/${instanceId}`);
  revalidatePath(`/clients/${clientId}`);
}

export async function startWorkflow(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");
  if (!clientId || !templateId) {
    throw new Error("Choose a client and a workflow template.");
  }

  const [client, template] = await Promise.all([
    prisma.client.findUnique({ where: { id: clientId } }),
    prisma.workflowTemplate.findUnique({
      where: { id: templateId },
      include: { steps: { orderBy: { order: "asc" } } },
    }),
  ]);

  if (!client) throw new Error("Client not found.");
  if (!template) throw new Error("Template not found.");
  if (template.steps.length === 0) {
    throw new Error("This template has no steps.");
  }

  const instance = await prisma.workflowInstance.create({
    data: {
      clientId,
      templateId,
      status: "ACTIVE",
      steps: {
        create: template.steps.map((step, index) => ({
          title: step.title,
          instructions: step.instructions,
          order: step.order,
          status: index === 0 ? "DOING" : "TODO",
        })),
      },
    },
  });

  await prisma.activity.create({
    data: {
      clientId,
      message: `Started workflow “${template.name}”`,
    },
  });

  revalidateWorkflow(clientId, instance.id);
  redirect(`/workflows/${instance.id}`);
}

export async function updateStepStatus(stepId: string, status: StepStatusValue) {
  if (!STEP_STATUSES.includes(status)) {
    throw new Error("Invalid step status.");
  }

  const step = await prisma.workflowInstanceStep.findUnique({
    where: { id: stepId },
    include: {
      instance: {
        include: {
          steps: { orderBy: { order: "asc" } },
          template: true,
        },
      },
    },
  });

  if (!step) throw new Error("Step not found.");

  const now = new Date();
  await prisma.workflowInstanceStep.update({
    where: { id: stepId },
    data: {
      status,
      completedAt: status === "DONE" ? now : null,
    },
  });

  if (status === "DONE") {
    const next = step.instance.steps.find(
      (candidate) => candidate.order > step.order && candidate.status === "TODO",
    );
    if (next) {
      await prisma.workflowInstanceStep.update({
        where: { id: next.id },
        data: { status: "DOING" },
      });
    }
  }

  const steps = await prisma.workflowInstanceStep.findMany({
    where: { instanceId: step.instanceId },
  });
  const allDone = steps.every((item) => item.status === "DONE");

  if (allDone && step.instance.status !== "COMPLETED") {
    await prisma.workflowInstance.update({
      where: { id: step.instanceId },
      data: { status: "COMPLETED", completedAt: now },
    });
    await prisma.activity.create({
      data: {
        clientId: step.instance.clientId,
        message: `Completed workflow “${step.instance.template.name}”`,
      },
    });
  } else if (!allDone && step.instance.status === "COMPLETED") {
    await prisma.workflowInstance.update({
      where: { id: step.instanceId },
      data: { status: "ACTIVE", completedAt: null },
    });
  } else if (status === "DONE") {
    await prisma.activity.create({
      data: {
        clientId: step.instance.clientId,
        message: `Marked “${step.title}” done in “${step.instance.template.name}”`,
      },
    });
  }

  revalidateWorkflow(step.instance.clientId, step.instanceId);
}

export async function updateStepDetails(stepId: string, formData: FormData) {
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const dueDate = parseDateInput(String(formData.get("dueDate") ?? ""));

  const step = await prisma.workflowInstanceStep.update({
    where: { id: stepId },
    data: { notes, dueDate },
    include: { instance: true },
  });

  revalidateWorkflow(step.instance.clientId, step.instanceId);
}

export async function completeWorkflow(instanceId: string) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id: instanceId },
    include: { steps: true, template: true },
  });
  if (!instance) throw new Error("Workflow not found.");

  const unfinished = instance.steps.filter((step) => step.status !== "DONE");
  if (unfinished.length > 0) {
    await prisma.workflowInstanceStep.updateMany({
      where: { id: { in: unfinished.map((step) => step.id) } },
      data: { status: "DONE", completedAt: new Date() },
    });
  }

  await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  await prisma.activity.create({
    data: {
      clientId: instance.clientId,
      message: `Completed workflow “${instance.template.name}”`,
    },
  });

  revalidateWorkflow(instance.clientId, instanceId);
}

export async function cancelWorkflow(instanceId: string) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id: instanceId },
    include: { template: true },
  });
  if (!instance) throw new Error("Workflow not found.");

  await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: { status: "CANCELLED", completedAt: null },
  });
  await prisma.activity.create({
    data: {
      clientId: instance.clientId,
      message: `Cancelled workflow “${instance.template.name}”`,
    },
  });

  revalidateWorkflow(instance.clientId, instanceId);
}

export async function reopenWorkflow(instanceId: string) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id: instanceId },
    include: { template: true },
  });
  if (!instance) throw new Error("Workflow not found.");

  await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: { status: "ACTIVE", completedAt: null },
  });
  await prisma.activity.create({
    data: {
      clientId: instance.clientId,
      message: `Reopened workflow “${instance.template.name}”`,
    },
  });

  revalidateWorkflow(instance.clientId, instanceId);
}
