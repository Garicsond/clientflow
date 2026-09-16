import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app-shell";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { ClientForm } from "../../client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title={`Edit ${client.name}`}
        actions={
          <Link
            href={`/clients/${client.id}`}
            className={buttonClass({ variant: "secondary" })}
          >
            Cancel
          </Link>
        }
      />
      <Card>
        <CardBody className="pt-5">
          <ClientForm client={client} />
        </CardBody>
      </Card>
    </div>
  );
}
