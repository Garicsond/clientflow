import type { PrismaClient } from "@prisma/client";
import { prisma } from "./db";

export async function seedIfEmpty(db: PrismaClient = prisma) {
  const existing = await db.client.count();
  if (existing > 0) return { seeded: false };

  const [maya] = await Promise.all([
    db.client.create({
      data: {
        name: "Maya Chen",
        company: "Northwind Design",
        email: "maya@northwind.design",
        phone: "+1 415 555 0142",
        status: "ACTIVE",
        tags: "retainer, brand",
        notes: "Brand and web retainer. Prefers Slack, weekly async updates.",
        activities: {
          create: { message: "Client added" },
        },
      },
    }),
    db.client.create({
      data: {
        name: "James Okonkwo",
        company: "Helios Labs",
        email: "james@helioslabs.io",
        phone: "+1 646 555 0198",
        status: "LEAD",
        tags: "inbound, product",
        notes: "Reached out after the conference talk. Interested in a 6-week discovery.",
        activities: {
          create: { message: "Client added" },
        },
      },
    }),
    db.client.create({
      data: {
        name: "Priya Shah",
        company: "Harbor Legal",
        email: "priya.shah@harborlegal.com",
        phone: "+1 212 555 0174",
        status: "PAUSED",
        tags: "legal, quarterly",
        notes: "Paused until their new partner class starts in October.",
        activities: {
          create: { message: "Client added" },
        },
      },
    }),
    db.client.create({
      data: {
        name: "Luca Moretti",
        company: null,
        email: "luca@moretti.studio",
        phone: "+39 02 555 011",
        status: "ACTIVE",
        tags: "freelance, photography",
        notes: "Independent photographer. Needs a simple booking + portfolio workflow.",
        activities: {
          create: { message: "Client added" },
        },
      },
    }),
    db.client.create({
      data: {
        name: "Elena Vasquez",
        company: "Cinder & Co",
        email: "elena@cinder.co",
        phone: "+1 303 555 0160",
        status: "CLOSED",
        tags: "alumni",
        notes: "Website rebuild shipped last quarter. Keep on the holiday card list.",
        activities: {
          create: { message: "Client added" },
        },
      },
    }),
  ]);

  const template = await db.workflowTemplate.create({
    data: {
      name: "Client onboarding",
      description:
        "Standard path from first conversation to first delivered milestone.",
      steps: {
        create: [
          {
            order: 0,
            title: "Discovery call",
            instructions: "Confirm goals, timeline, budget, and decision-makers.",
          },
          {
            order: 1,
            title: "Send proposal",
            instructions: "Draft scope, pricing, and timeline; send for review.",
          },
          {
            order: 2,
            title: "Kickoff meeting",
            instructions: "Align on deliverables, communication cadence, and access.",
          },
          {
            order: 3,
            title: "Collect assets",
            instructions: "Request brand files, logins, and existing work samples.",
          },
          {
            order: 4,
            title: "First milestone",
            instructions: "Deliver the first agreed output and gather feedback.",
          },
        ],
      },
    },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  await db.workflowInstance.create({
    data: {
      templateId: template.id,
      clientId: maya.id,
      status: "ACTIVE",
      steps: {
        create: template.steps.map((step, index) => ({
          title: step.title,
          instructions: step.instructions,
          order: step.order,
          status: index === 0 ? "DONE" : index === 1 ? "DOING" : "TODO",
          completedAt: index === 0 ? new Date() : null,
          notes: index === 0 ? "Call went well — they want a 3-month retainer." : null,
        })),
      },
    },
  });

  await db.activity.create({
    data: {
      clientId: maya.id,
      message: "Started workflow “Client onboarding”",
    },
  });

  return { seeded: true };
}
