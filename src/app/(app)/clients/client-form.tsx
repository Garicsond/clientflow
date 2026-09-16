"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import { CLIENT_STATUSES, CLIENT_STATUS_LABELS } from "@/lib/constants";
import { createClient, updateClient } from "@/app/actions/clients";

type ClientFormValues = {
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: (typeof CLIENT_STATUSES)[number];
  tags: string;
  notes: string | null;
};

export function ClientForm({
  client,
}: {
  client?: ClientFormValues & { id: string };
}) {
  const action = client
    ? updateClient.bind(null, client.id)
    : createClient;

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            defaultValue={client?.name}
            placeholder="Maya Chen"
          />
        </Field>
        <Field label="Company" htmlFor="company">
          <Input
            id="company"
            name="company"
            defaultValue={client?.company ?? ""}
            placeholder="Northwind Design"
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            placeholder="maya@studio.com"
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            defaultValue={client?.phone ?? ""}
            placeholder="+1 415 555 0142"
          />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select
            id="status"
            name="status"
            defaultValue={client?.status ?? "LEAD"}
          >
            {CLIENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {CLIENT_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Tags"
          htmlFor="tags"
          hint="Comma-separated, e.g. retainer, brand"
        >
          <Input
            id="tags"
            name="tags"
            defaultValue={client?.tags ?? ""}
            placeholder="retainer, brand"
          />
        </Field>
      </div>
      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          defaultValue={client?.notes ?? ""}
          placeholder="How you work together, preferences, context…"
        />
      </Field>
      <div className="flex justify-end">
        <Button>{client ? "Save client" : "Add client"}</Button>
      </div>
    </form>
  );
}
