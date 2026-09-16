import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteTemplate } from "@/app/actions/templates";
import { PageHeader } from "@/components/app-shell";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { TemplateForm } from "../template-form";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await prisma.workflowTemplate.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      _count: { select: { instances: true } },
    },
  });

  if (!template) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Playbooks"
        title={template.name}
        description={
          template._count.instances > 0
            ? `${template._count.instances} instance${template._count.instances === 1 ? "" : "s"} started from this template. Editing steps only affects new runs.`
            : "No instances yet — you can still edit freely, or delete this template."
        }
        actions={
          <>
            <Link href="/templates" className={buttonClass({ variant: "secondary" })}>
              Back
            </Link>
            {template._count.instances === 0 ? (
              <form action={deleteTemplate.bind(null, template.id)}>
                <Button variant="danger">Delete</Button>
              </form>
            ) : null}
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Edit template</CardTitle>
        </CardHeader>
        <CardBody>
          <TemplateForm template={template} />
        </CardBody>
      </Card>
    </div>
  );
}
