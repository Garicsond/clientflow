import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { TemplateForm } from "../template-form";

export default function NewTemplatePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Playbooks"
        title="New template"
        description="Name the workflow and list the ordered steps you’ll run for a client."
        actions={
          <Link href="/templates" className={buttonClass({ variant: "secondary" })}>
            Cancel
          </Link>
        }
      />
      <Card>
        <CardBody className="pt-5">
          <TemplateForm />
        </CardBody>
      </Card>
    </div>
  );
}
