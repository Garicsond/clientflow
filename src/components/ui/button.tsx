import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-[#a94c1d] disabled:bg-accent/50",
  secondary:
    "bg-white text-foreground border border-stone-300 hover:bg-stone-50 disabled:opacity-50",
  ghost: "text-foreground hover:bg-stone-200/70 disabled:opacity-50",
  danger: "bg-red-700 text-white hover:bg-red-800 disabled:opacity-50",
  ink: "bg-ink text-paper hover:bg-[#111820] disabled:opacity-50",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
} as const;

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "submit",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      {...props}
    />
  );
}
