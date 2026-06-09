import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "yellow" | "blue" | "green" | "red" | "purple";
}

const accentConfig = {
  blue: {
    bar: "bg-gradient-to-r from-blue-500 to-blue-600",
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    glow: "shadow-blue-500/10",
  },
  green: {
    bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    glow: "shadow-emerald-500/10",
  },
  red: {
    bar: "bg-gradient-to-r from-rose-500 to-red-500",
    icon: "bg-rose-50 text-rose-600 ring-rose-100",
    glow: "shadow-rose-500/10",
  },
  yellow: {
    bar: "bg-gradient-to-r from-amber-400 to-orange-500",
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    glow: "shadow-amber-500/10",
  },
  purple: {
    bar: "bg-gradient-to-r from-violet-500 to-purple-600",
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    glow: "shadow-violet-500/10",
  },
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "blue",
}: KpiCardProps) {
  const style = accentConfig[accent];

  return (
    <div
      className={`pro-card group relative overflow-hidden p-3 hover:-translate-y-0.5 ${style.glow}`}
    >
      <div className={`absolute left-0 top-0 h-1 w-full ${style.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {subtitle ? (
            <p className="mt-0.5 text-[10px] text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        <div
          className={`shrink-0 rounded-lg p-2 ring-1 transition group-hover:scale-105 ${style.icon}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
