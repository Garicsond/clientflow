import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { seedIfEmpty, shouldSeedSampleData } from "@/lib/seed";
import { sitePasswordConfigured } from "@/lib/site-auth";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (shouldSeedSampleData()) {
    await seedIfEmpty();
  }

  return <AppShell showLock={sitePasswordConfigured()}>{children}</AppShell>;
}
