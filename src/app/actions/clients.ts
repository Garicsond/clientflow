"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CLIENT_STATUSES, type ClientStatusValue } from "@/lib/constants";
import { parseTags } from "@/lib/utils";

function readStatus(value: FormDataEntryValue | null): ClientStatusValue {
  const status = String(value ?? "LEAD");
  return CLIENT_STATUSES.includes(status as ClientStatusValue)
    ? (status as ClientStatusValue)
    : "LEAD";
}

function clientFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Name is required.");
  }

  return {
    name,
    company: String(formData.get("company") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    status: readStatus(formData.get("status")),
    tags: parseTags(String(formData.get("tags") ?? "")).join(", "),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createClient(formData: FormData) {
  const data = clientFields(formData);
  const client = await prisma.client.create({
    data: {
      ...data,
      activities: { create: { message: "Client added" } },
    },
  });

  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(clientId: string, formData: FormData) {
  const data = clientFields(formData);
  await prisma.client.update({
    where: { id: clientId },
    data: {
      ...data,
      activities: { create: { message: "Client details updated" } },
    },
  });

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function archiveClient(clientId: string) {
  await prisma.client.update({
    where: { id: clientId },
    data: {
      archived: true,
      activities: { create: { message: "Client archived" } },
    },
  });

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function restoreClient(clientId: string) {
  await prisma.client.update({
    where: { id: clientId },
    data: {
      archived: false,
      activities: { create: { message: "Client restored" } },
    },
  });

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}
