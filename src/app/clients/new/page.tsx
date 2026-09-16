import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ClientForm } from "../client-form";

export default function NewClientPage() {
  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="New client"
        description="Add someone to the book. You can start a workflow once they’re in."
        actions={
          <Link href="/clients" className={buttonClass({ variant: "secondary" })}>
            Cancel
          </Link>
        }
      />
      <Card>
        <CardBody className="pt-5">
          <ClientForm />
        </CardBody>
      </Card>
    </div>
  );
}
