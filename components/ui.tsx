import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";
  const variants = {
    primary:
      "text-ink bg-gradient-to-r from-teal via-cyan to-violet hover:brightness-110 shadow-[0_8px_30px_-10px_rgba(34,211,238,0.6)]",
    outline: "border border-line text-foreground hover:bg-panel-2/60",
    ghost: "text-muted hover:text-foreground hover:bg-panel-2/50",
    danger: "border border-magenta/40 text-magenta hover:bg-magenta/10",
  } as const;
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("glass rounded-2xl p-5", className)}>{children}</div>
  );
}

export function Pill({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-panel-2/50 px-3 py-1 text-xs font-medium text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-faint border-t-teal",
        className,
      )}
    />
  );
}
