import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { ClientStatusBadge, Tag } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { Input, Select } from "@/components/ui/fields";
import { CLIENT_STATUSES, CLIENT_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { initials, parseTags } from "@/lib/utils";
import type { ClientStatus, Prisma } from "@prisma/client";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const showArchived = params.archived === "1";

  const where: Prisma.ClientWhereInput = {
    archived: showArchived ? true : false,
  };

  if (status !== "all" && CLIENT_STATUSES.includes(status as (typeof CLIENT_STATUSES)[number])) {
    where.status = status as ClientStatus;
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { company: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { workflows: true } },
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Clients"
        description="Everyone you work with — leads through closed engagements."
        actions={
          <Link href="/clients/new" className={buttonClass()}>
            Add client
          </Link>
        }
      />

      <form className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input name="q" defaultValue={q} placeholder="Search name, company, email" />
        </div>
        <Select name="status" defaultValue={status} className="w-40">
          <option value="all">All statuses</option>
          {CLIENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CLIENT_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
        <label className="mb-2 flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            name="archived"
            value="1"
            defaultChecked={showArchived}
            className="size-4 rounded border-stone-300"
          />
          Archived
        </label>
        <button type="submit" className={buttonClass({ variant: "secondary" })}>
          Filter
        </button>
      </form>

      {clients.length === 0 ? (
        <EmptyState
          title={q || status !== "all" || showArchived ? "No matches" : "No clients yet"}
          description="Add your first client, or loosen the filters."
          action={
            <Link href="/clients/new" className={buttonClass()}>
              Add client
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50/80 text-left text-xs uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Tags</th>
                <th className="px-5 py-3 font-medium">Workflows</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-stone-50/70">
                  <td className="px-5 py-3">
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-paper">
                        {initials(client.name)}
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{client.name}</span>
                        <span className="block text-xs text-stone-500">
                          {client.company || client.email || "—"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <ClientStatusBadge status={client.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {parseTags(client.tags).length === 0
                        ? <span className="text-stone-400">—</span>
                        : parseTags(client.tags).map((tag) => <Tag key={tag}>{tag}</Tag>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-stone-600">{client._count.workflows}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
