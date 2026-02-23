import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function StatCard({
  icon,
  iconBg,
  value,
  label,
  trend,
  trendLabel,
  href,
  urgent,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number | string;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  href?: string;
  urgent?: boolean;
}) {
  const isUrgent = urgent && Number(value) > 0;

  const content = (
    <div
      className={`
        group relative rounded-xl border bg-background px-5 py-5 h-full
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm
        ${isUrgent ? "border-red-200 dark:border-red-800/60" : "border-border/60 hover:border-border"}
      `}
    >
      {/* Urgent dot */}
      {isUrgent && (
        <span className="absolute top-4 right-4 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      )}

      {/* Icon + Number side by side */}
      <div className="flex items-center gap-3.5 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <p className="text-[2rem] font-bold tracking-tight text-foreground leading-none">
          {value}
        </p>
      </div>

      {/* Label */}
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
        {label}
      </p>

      {/* Trend */}
      {trendLabel && (
        <div
          className={`flex items-center gap-1 mt-2.5 text-xs font-semibold ${
            trend === "up"
              ? "text-emerald-600"
              : trend === "down"
                ? "text-red-500"
                : "text-muted-foreground"
          }`}
        >
          {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
          {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
          {trend === "neutral" && <Minus className="w-3 h-3" />}
          {trendLabel}
        </div>
      )}

      {/* Hover arrow for linked cards */}
      {href && (
        <ArrowUpRight className="absolute top-4 right-4 w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}