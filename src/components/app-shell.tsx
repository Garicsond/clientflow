"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/workflows", label: "Workflows", icon: ListChecks },
  { href: "/templates", label: "Templates", icon: Workflow },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-sidebar text-paper">
        <div className="px-5 pt-6 pb-8">
          <Link href="/" className="block">
            <p className="font-serif text-2xl tracking-tight">Clientflow</p>
            <p className="mt-1 text-xs text-paper/55">Clients & workflows</p>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-paper/70 hover:bg-white/5 hover:text-paper",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-[11px] leading-relaxed text-paper/45">
          Local mode — no sign-in.
          <br />
          TODO: add authentication before any shared or production use.
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-8 py-8">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-4xl tracking-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-stone-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
