export const CLIENT_STATUSES = ["LEAD", "ACTIVE", "PAUSED", "CLOSED"] as const;
export const INSTANCE_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;
export const STEP_STATUSES = ["TODO", "DOING", "DONE"] as const;

export type ClientStatusValue = (typeof CLIENT_STATUSES)[number];
export type InstanceStatusValue = (typeof INSTANCE_STATUSES)[number];
export type StepStatusValue = (typeof STEP_STATUSES)[number];

export const CLIENT_STATUS_LABELS: Record<ClientStatusValue, string> = {
  LEAD: "Lead",
  ACTIVE: "Active",
  PAUSED: "Paused",
  CLOSED: "Closed",
};

export const INSTANCE_STATUS_LABELS: Record<InstanceStatusValue, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STEP_STATUS_LABELS: Record<StepStatusValue, string> = {
  TODO: "To do",
  DOING: "Doing",
  DONE: "Done",
};
