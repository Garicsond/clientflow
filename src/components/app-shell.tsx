"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Lock,
  Users,
  Workflow,
} from "lucide-react";
import { lockSite } from "@/app/unlock/actions";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/workflows", label: "Workflows", icon: ListChecks },
  { href: "/templates", label: "Templates", icon: Workflow },
];

export function AppShell({
  children,
  showLock = false,
}: {
  children: ReactNode;
  showLock?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-paper md:flex">
        <div className="px-5 pt-6 pb-8">
          <Link href="/" className="block">
            <p className="font-serif text-2xl tracking-tight">Clientflow</p>
            <p className="mt-1 text-xs text-paper/55">Clients & workflows</p>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {nav.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-[11px] leading-relaxed text-paper/45">
          {showLock ? (
            <>
              Shared password until real auth.
              <form action={lockSite} className="mt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-[11px] text-paper/70 hover:text-paper"
                >
                  <Lock className="size-3" />
                  Lock this device
                </button>
              </form>
            </>
          ) : (
            <>Local mode — password gate is off.</>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-sidebar px-4 py-3 text-paper md:hidden">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Clientflow
          </Link>
          {showLock ? (
            <form action={lockSite}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs text-paper/70"
                aria-label="Lock this device"
              >
                <Lock className="size-3.5" />
                Lock
              </button>
            </form>
          ) : null}
        </header>

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-white/10 bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-1 py-2.5 text-[11px]",
                active ? "text-white" : "text-paper/55",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
}: {
  item: (typeof nav)[number];
  pathname: string;
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-serif text-3xl tracking-tight break-words text-ink md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-stone-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
