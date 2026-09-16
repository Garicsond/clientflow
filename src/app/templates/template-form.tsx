"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { createTemplate, updateTemplate } from "@/app/actions/templates";

type StepDraft = { title: string; instructions: string };

export function TemplateForm({
  template,
}: {
  template?: {
    id: string;
    name: string;
    description: string | null;
    steps: { title: string; instructions: string | null }[];
  };
}) {
  const [steps, setSteps] = useState<StepDraft[]>(
    template?.steps.length
      ? template.steps.map((step) => ({
          title: step.title,
          instructions: step.instructions ?? "",
        }))
      : [{ title: "", instructions: "" }],
  );

  const payload = useMemo(() => JSON.stringify(steps), [steps]);
  const action = template
    ? updateTemplate.bind(null, template.id)
    : createTemplate;

  function updateStep(index: number, patch: Partial<StepDraft>) {
    setSteps((current) =>
      current.map((step, i) => (i === index ? { ...step, ...patch } : step)),
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="steps" value={payload} />
      <Field label="Template name" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          defaultValue={template?.name}
          placeholder="Client onboarding"
        />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          defaultValue={template?.description ?? ""}
          placeholder="When to use this workflow, and what “done” looks like."
        />
      </Field>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-stone-700">Steps</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setSteps((current) => [
                ...current,
                { title: "", instructions: "" },
              ])
            }
          >
            <Plus className="size-3.5" />
            Add step
          </Button>
        </div>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={index}
              className="rounded-xl border border-stone-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                  Step {index + 1}
                </p>
                {steps.length > 1 ? (
                  <button
                    type="button"
                    className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-red-700"
                    onClick={() =>
                      setSteps((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                    aria-label={`Remove step ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
              <div className="space-y-3">
                <Input
                  required
                  value={step.title}
                  onChange={(event) =>
                    updateStep(index, { title: event.target.value })
                  }
                  placeholder="Discovery call"
                />
                <Textarea
                  value={step.instructions}
                  onChange={(event) =>
                    updateStep(index, { instructions: event.target.value })
                  }
                  placeholder="Optional instructions for whoever runs this step."
                  className="min-h-20"
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex justify-end">
        <Button>{template ? "Save template" : "Create template"}</Button>
      </div>
    </form>
  );
}
