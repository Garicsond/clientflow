import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function TemplatesPage() {
  const templates = await prisma.workflowTemplate.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { steps: true, instances: true } },
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Playbooks"
        title="Workflow templates"
        description="Reusable step lists you can start on any client."
        actions={
          <Link href="/templates/new" className={buttonClass()}>
            New template
          </Link>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Create a template such as onboarding, monthly check-in, or project kickoff."
          action={
            <Link href="/templates/new" className={buttonClass()}>
              New template
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Link key={template.id} href={`/templates/${template.id}`}>
              <Card className="h-full p-5 transition hover:border-stone-300">
                <h2 className="font-serif text-2xl text-ink">{template.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-stone-500">
                  {template.description || "No description"}
                </p>
                <p className="mt-4 text-xs text-stone-400">
                  {template._count.steps} steps · {template._count.instances}{" "}
                  instances · Updated {formatDate(template.updatedAt)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
