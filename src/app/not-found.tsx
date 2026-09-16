import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-24 text-center">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
          404
        </p>
        <h1 className="mt-2 font-serif text-4xl text-ink">That page isn’t here</h1>
        <p className="mt-2 text-sm text-stone-500">
          The client, template, or workflow may have been removed.
        </p>
        <Link href="/" className={`${buttonClass()} mt-6`}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
