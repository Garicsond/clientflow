import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app-shell";
import { InstanceStatusBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/empty";
import { WorkflowSteps } from "@/components/workflow-steps";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = await prisma.workflowInstance.findUnique({
    where: { id },
    include: {
      client: true,
      template: true,
      steps: { orderBy: { order: "asc" } },
    },
  });

  if (!workflow) notFound();

  const done = workflow.steps.filter((step) => step.status === "DONE").length;

  return (
    <div>
      <PageHeader
        eyebrow="Workflow"
        title={workflow.template.name}
        description={`For ${workflow.client.name}${workflow.client.company ? ` · ${workflow.client.company}` : ""}`}
        actions={
          <Link
            href={`/clients/${workflow.client.id}`}
            className={buttonClass({ variant: "secondary" })}
          >
            View client
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <InstanceStatusBadge status={workflow.status} />
        <ProgressBar done={done} total={workflow.steps.length} />
        <p className="text-sm text-stone-500">
          Started {formatDate(workflow.createdAt)}
          {workflow.completedAt ? ` · Completed ${formatDate(workflow.completedAt)}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardBody>
          <WorkflowSteps
            instanceId={workflow.id}
            instanceStatus={workflow.status}
            steps={workflow.steps}
          />
        </CardBody>
      </Card>
    </div>
  );
}
