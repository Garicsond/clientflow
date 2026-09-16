import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/fields";
import { isValidUnlockToken, SITE_UNLOCK_COOKIE } from "@/lib/site-auth";
import { unlockSite } from "./actions";

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const password = process.env.SITE_PASSWORD;
  const jar = await cookies();
  const unlocked = isValidUnlockToken(jar.get(SITE_UNLOCK_COOKIE)?.value);

  if (unlocked) {
    redirect("/");
  }

  if (!password && process.env.NODE_ENV !== "production") {
    redirect("/");
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-stone-200/80 bg-card p-6 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
          Clientflow
        </p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink">
          Unlock
        </h1>
        {!password ? (
          <p className="mt-3 text-sm text-stone-500">
            This deployment has no <code className="font-mono text-xs">SITE_PASSWORD</code>{" "}
            yet, so the app stays locked. Set that env var on the host and redeploy.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-stone-500">
              Enter the shared site password to use Clientflow on this device.
            </p>
            <form action={unlockSite} className="mt-6 space-y-4">
              <Field label="Password" htmlFor="password">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  autoFocus
                />
              </Field>
              {error ? (
                <p className="text-sm text-red-700" role="alert">
                  That password doesn’t match.
                </p>
              ) : null}
              <Button className="w-full">Continue</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
