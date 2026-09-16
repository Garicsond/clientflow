"use client";

import {
  cancelWorkflow,
  completeWorkflow,
  reopenWorkflow,
  updateStepDetails,
  updateStepStatus,
} from "@/app/actions/workflows";
import { Button } from "@/components/ui/button";
import { StepStatusBadge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/fields";
import { STEP_STATUSES, type StepStatusValue } from "@/lib/constants";
import { toDateInput } from "@/lib/utils";
import { Check, Circle, CircleDot } from "lucide-react";

type Step = {
  id: string;
  title: string;
  instructions: string | null;
  order: number;
  status: StepStatusValue;
  dueDate: Date | string | null;
  notes: string | null;
};

export function WorkflowSteps({
  instanceId,
  instanceStatus,
  steps,
}: {
  instanceId: string;
  instanceStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
  steps: Step[];
}) {
  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <StatusIcon status={step.status} />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-0.5 text-base font-medium text-ink">
                    {step.title}
                  </h3>
                  {step.instructions ? (
                    <p className="mt-1 max-w-xl text-sm text-stone-500">
                      {step.instructions}
                    </p>
                  ) : null}
                </div>
              </div>
              <StepStatusBadge status={step.status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {STEP_STATUSES.map((status) => (
                <form
                  key={status}
                  action={updateStepStatus.bind(null, step.id, status)}
                >
                  <Button
                    type="submit"
                    size="sm"
                    variant={step.status === status ? "ink" : "secondary"}
                    disabled={step.status === status}
                  >
                    {status === "TODO"
                      ? "To do"
                      : status === "DOING"
                        ? "Doing"
                        : "Done"}
                  </Button>
                </form>
              ))}
            </div>
            <form
              action={updateStepDetails.bind(null, step.id)}
              className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]"
            >
              <Input
                type="date"
                name="dueDate"
                defaultValue={toDateInput(step.dueDate)}
                aria-label="Due date"
              />
              <Textarea
                name="notes"
                defaultValue={step.notes ?? ""}
                placeholder="Step notes…"
                className="min-h-10 py-2"
              />
              <Button type="submit" variant="secondary" size="sm" className="self-start">
                Save notes
              </Button>
            </form>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        {instanceStatus === "ACTIVE" ? (
          <>
            <form action={completeWorkflow.bind(null, instanceId)}>
              <Button variant="primary">Complete workflow</Button>
            </form>
            <form action={cancelWorkflow.bind(null, instanceId)}>
              <Button variant="secondary">Cancel</Button>
            </form>
          </>
        ) : (
          <form action={reopenWorkflow.bind(null, instanceId)}>
            <Button variant="secondary">Reopen workflow</Button>
          </form>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: StepStatusValue }) {
  if (status === "DONE") {
    return (
      <span className="mt-1 flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
        <Check className="size-3.5" />
      </span>
    );
  }
  if (status === "DOING") {
    return (
      <span className="mt-1 flex size-6 items-center justify-center rounded-full bg-sky-100 text-sky-800">
        <CircleDot className="size-3.5" />
      </span>
    );
  }
  return (
    <span className="mt-1 flex size-6 items-center justify-center rounded-full bg-stone-100 text-stone-500">
      <Circle className="size-3.5" />
    </span>
  );
}
