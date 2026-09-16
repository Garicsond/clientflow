"use client";

import { startWorkflow } from "@/app/actions/workflows";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";

export function StartWorkflowForm({
  clientId,
  templates,
}: {
  clientId: string;
  templates: { id: string; name: string }[];
}) {
  if (templates.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Create a workflow template first, then you can start it for this client.
      </p>
    );
  }

  return (
    <form action={startWorkflow} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="clientId" value={clientId} />
      <Select name="templateId" defaultValue={templates[0]!.id} className="flex-1">
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </Select>
      <Button>Start</Button>
    </form>
  );
}
