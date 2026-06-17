import { cn } from "@/lib/utils";

/** Marca RL1: cubo wireframe (eco del logo) + wordmark en degradé. */
export function LogoRL1({
  className,
  size = 34,
  wordmark = true,
}: {
  className?: string;
  size?: number;
  wordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="rl1g" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="0.45" stopColor="#22d3ee" />
            <stop offset="0.75" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        <g stroke="url(#rl1g)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
          {/* cubo isométrico */}
          <path d="M32 8 L54 20 L54 44 L32 56 L10 44 L10 20 Z" opacity="0.9" />
          <path d="M32 8 L32 32 M10 20 L32 32 L54 20" opacity="0.55" />
          {/* figura central */}
          <circle cx="32" cy="26" r="4.2" fill="url(#rl1g)" stroke="none" />
          <path d="M32 31 L32 47 M24 36 L32 33 L40 36 M28 54 L32 47 L36 54" />
        </g>
      </svg>
      {wordmark && (
        <span className="text-gradient font-mono text-xl font-bold tracking-tight">
          RL1
        </span>
      )}
    </span>
  );
}
