"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-24 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
        Something went wrong
      </p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Couldn’t complete that</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
        {error.message || "Try again, or go back to the dashboard."}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button type="button" onClick={reset} className={buttonClass({ variant: "secondary" })}>
          Try again
        </button>
        <Link href="/" className={buttonClass()}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
