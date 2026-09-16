import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { InstanceStatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ProgressBar } from "@/components/ui/empty";
import { INSTANCE_STATUSES, INSTANCE_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Prisma, WorkflowInstanceStatus } from "@prisma/client";

export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "ACTIVE";

  const where: Prisma.WorkflowInstanceWhereInput = {};
  if (status !== "all" && INSTANCE_STATUSES.includes(status as (typeof INSTANCE_STATUSES)[number])) {
    where.status = status as WorkflowInstanceStatus;
  }

  const workflows = await prisma.workflowInstance.findMany({
    where,
    include: {
      client: true,
      template: true,
      steps: { orderBy: { order: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const filters = [
    { value: "ACTIVE", label: INSTANCE_STATUS_LABELS.ACTIVE },
    { value: "COMPLETED", label: INSTANCE_STATUS_LABELS.COMPLETED },
    { value: "CANCELLED", label: INSTANCE_STATUS_LABELS.CANCELLED },
    { value: "all", label: "All" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Work"
        title="Workflows"
        description="Every running, completed, or cancelled instance across clients."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === "ACTIVE" ? "/workflows" : `/workflows?status=${filter.value}`}
            className={buttonClass({
              variant: status === filter.value ? "ink" : "secondary",
              size: "sm",
            })}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {workflows.length === 0 ? (
        <EmptyState
          title="No workflows here"
          description="Start a template from a client page to see it in this list."
          action={
            <Link href="/clients" className={buttonClass()}>
              Go to clients
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="bg-stone-50/80 text-left text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Workflow</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Progress</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {workflows.map((workflow) => {
                const done = workflow.steps.filter((step) => step.status === "DONE").length;
                return (
                  <tr key={workflow.id} className="hover:bg-stone-50/70">
                    <td className="px-5 py-3">
                      <Link href={`/workflows/${workflow.id}`} className="font-medium text-ink hover:underline">
                        {workflow.template.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/clients/${workflow.client.id}`} className="hover:underline">
                        {workflow.client.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <ProgressBar done={done} total={workflow.steps.length} />
                    </td>
                    <td className="px-5 py-3">
                      <InstanceStatusBadge status={workflow.status} />
                    </td>
                    <td className="px-5 py-3 text-stone-500">
                      {formatDate(workflow.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  );
}
