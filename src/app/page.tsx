import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { ClientStatusBadge, InstanceStatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ProgressBar } from "@/components/ui/empty";
import { prisma } from "@/lib/db";
import { initials, relativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const [clients, activeClients, archivedClients, templates, activeWorkflows, recentClients, workflows] =
    await Promise.all([
      prisma.client.count({ where: { archived: false } }),
      prisma.client.count({ where: { archived: false, status: "ACTIVE" } }),
      prisma.client.count({ where: { archived: true } }),
      prisma.workflowTemplate.count(),
      prisma.workflowInstance.count({ where: { status: "ACTIVE" } }),
      prisma.client.findMany({
        where: { archived: false },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.workflowInstance.findMany({
        where: { status: "ACTIVE" },
        include: {
          client: true,
          template: true,
          steps: { orderBy: { order: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

  const stats = [
    { label: "Clients", value: clients, hint: archivedClients ? `${archivedClients} archived` : "In the book" },
    { label: "Active clients", value: activeClients, hint: "Currently engaged" },
    { label: "Active workflows", value: activeWorkflows, hint: "In progress" },
    { label: "Templates", value: templates, hint: "Reusable playbooks" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Desk"
        description="Recent clients and the workflows currently in motion."
        actions={
          <>
            <Link href="/clients/new" className={buttonClass({ variant: "secondary" })}>
              Add client
            </Link>
            <Link href="/templates/new" className={buttonClass()}>
              New template
            </Link>
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-4xl text-ink">{stat.value}</p>
            <p className="mt-1 text-xs text-stone-500">{stat.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent clients</CardTitle>
            <Link href="/clients" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {recentClients.length === 0 ? (
              <EmptyState
                title="No clients yet"
                description="Add a client to start tracking work."
                action={
                  <Link href="/clients/new" className={buttonClass()}>
                    Add client
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-stone-100">
                {recentClients.map((client) => (
                  <li key={client.id}>
                    <Link
                      href={`/clients/${client.id}`}
                      className="flex items-center gap-3 py-3 transition hover:bg-stone-50/80"
                    >
                      <span className="flex size-9 items-center justify-center rounded-full bg-ink text-xs font-medium text-paper">
                        {initials(client.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-ink">
                          {client.name}
                        </span>
                        <span className="block truncate text-xs text-stone-500">
                          {client.company || client.email || "No company"}
                        </span>
                      </span>
                      <ClientStatusBadge status={client.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active workflows</CardTitle>
            <Link href="/workflows" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {workflows.length === 0 ? (
              <EmptyState
                title="Nothing in motion"
                description="Start a template on a client to track steps here."
              />
            ) : (
              <ul className="space-y-4">
                {workflows.map((workflow) => {
                  const done = workflow.steps.filter((step) => step.status === "DONE").length;
                  return (
                    <li key={workflow.id}>
                      <Link href={`/workflows/${workflow.id}`} className="block rounded-xl hover:bg-stone-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {workflow.template.name}
                            </p>
                            <p className="truncate text-xs text-stone-500">
                              {workflow.client.name}
                              {workflow.client.company ? ` · ${workflow.client.company}` : ""}
                            </p>
                          </div>
                          <InstanceStatusBadge status={workflow.status} />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <ProgressBar done={done} total={workflow.steps.length} />
                          <span className="text-[11px] text-stone-400">
                            {relativeTime(workflow.updatedAt)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
