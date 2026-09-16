import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveClient, restoreClient } from "@/app/actions/clients";
import { PageHeader } from "@/components/app-shell";
import { StartWorkflowForm } from "@/components/start-workflow-form";
import { ClientStatusBadge, InstanceStatusBadge, Tag } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ProgressBar } from "@/components/ui/empty";
import { prisma } from "@/lib/db";
import { formatDate, parseTags, relativeTime } from "@/lib/utils";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, templates] = await Promise.all([
    prisma.client.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        workflows: {
          include: {
            template: true,
            steps: { orderBy: { order: "asc" } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.workflowTemplate.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!client) notFound();

  const tags = parseTags(client.tags);

  return (
    <div>
      <PageHeader
        eyebrow={client.company || "Client"}
        title={client.name}
        description={client.notes || "No notes yet."}
        actions={
          <>
            <Link
              href={`/clients/${client.id}/edit`}
              className={buttonClass({ variant: "secondary" })}
            >
              Edit
            </Link>
            {client.archived ? (
              <form action={restoreClient.bind(null, client.id)}>
                <Button variant="primary">Restore</Button>
              </form>
            ) : (
              <form action={archiveClient.bind(null, client.id)}>
                <Button variant="secondary">Archive</Button>
              </form>
            )}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <ClientStatusBadge status={client.status} />
        {client.archived ? (
          <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600">
            Archived
          </span>
        ) : null}
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Item label="Email">
                  {client.email ? (
                    <a href={`mailto:${client.email}`} className="text-accent hover:underline">
                      {client.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </Item>
                <Item label="Phone">
                  {client.phone ? (
                    <a href={`tel:${client.phone}`} className="text-accent hover:underline">
                      {client.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </Item>
                <Item label="Company">{client.company || "—"}</Item>
                <Item label="Added">{formatDate(client.createdAt)}</Item>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned workflows</CardTitle>
            </CardHeader>
            <CardBody className="space-y-5">
              {!client.archived ? (
                <StartWorkflowForm clientId={client.id} templates={templates} />
              ) : (
                <p className="text-sm text-stone-500">
                  Restore this client to start a new workflow.
                </p>
              )}
              {client.workflows.length === 0 ? (
                <EmptyState
                  title="No workflows yet"
                  description="Start a template to track onboarding or delivery steps."
                />
              ) : (
                <ul className="divide-y divide-stone-100">
                  {client.workflows.map((workflow) => {
                    const done = workflow.steps.filter((step) => step.status === "DONE").length;
                    return (
                      <li key={workflow.id} className="py-3 first:pt-0">
                        <Link href={`/workflows/${workflow.id}`} className="block">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-ink">{workflow.template.name}</p>
                              <p className="text-xs text-stone-500">
                                Started {formatDate(workflow.createdAt)}
                              </p>
                            </div>
                            <InstanceStatusBadge status={workflow.status} />
                          </div>
                          <div className="mt-2">
                            <ProgressBar done={done} total={workflow.steps.length} />
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

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardBody>
            {client.activities.length === 0 ? (
              <p className="text-sm text-stone-500">No activity yet.</p>
            ) : (
              <ol className="space-y-4">
                {client.activities.map((activity) => (
                  <li key={activity.id} className="relative pl-4">
                    <span className="absolute top-1.5 left-0 size-1.5 rounded-full bg-accent" />
                    <p className="text-sm text-ink">{activity.message}</p>
                    <p className="text-xs text-stone-400">
                      {relativeTime(activity.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-stone-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ink">{children}</dd>
    </div>
  );
}
