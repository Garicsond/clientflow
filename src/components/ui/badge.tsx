import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CLIENT_STATUS_LABELS,
  INSTANCE_STATUS_LABELS,
  STEP_STATUS_LABELS,
  type ClientStatusValue,
  type InstanceStatusValue,
  type StepStatusValue,
} from "@/lib/constants";

const clientStyles: Record<ClientStatusValue, string> = {
  LEAD: "bg-amber-100 text-amber-900",
  ACTIVE: "bg-teal-100 text-teal-900",
  PAUSED: "bg-stone-200 text-stone-700",
  CLOSED: "bg-zinc-200 text-zinc-600",
};

const instanceStyles: Record<InstanceStatusValue, string> = {
  ACTIVE: "bg-teal-100 text-teal-900",
  COMPLETED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-stone-200 text-stone-600",
};

const stepStyles: Record<StepStatusValue, string> = {
  TODO: "bg-stone-200 text-stone-700",
  DOING: "bg-sky-100 text-sky-900",
  DONE: "bg-emerald-100 text-emerald-900",
};

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function ClientStatusBadge({ status }: { status: ClientStatusValue }) {
  return (
    <Badge className={clientStyles[status]}>{CLIENT_STATUS_LABELS[status]}</Badge>
  );
}

export function InstanceStatusBadge({
  status,
}: {
  status: InstanceStatusValue;
}) {
  return (
    <Badge className={instanceStyles[status]}>
      {INSTANCE_STATUS_LABELS[status]}
    </Badge>
  );
}

export function StepStatusBadge({ status }: { status: StepStatusValue }) {
  return <Badge className={stepStyles[status]}>{STEP_STATUS_LABELS[status]}</Badge>;
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <Badge className="bg-paper text-stone-700 ring-1 ring-stone-300/80">
      {children}
    </Badge>
  );
}
