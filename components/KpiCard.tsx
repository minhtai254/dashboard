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
    bar: "bg-blue-500",
    icon: "bg-blue-50 text-blue-600",
  },
  green: {
    bar: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
  },
  red: {
    bar: "bg-red-500",
    icon: "bg-red-50 text-red-600",
  },
  yellow: {
    bar: "bg-amber-500",
    icon: "bg-amber-50 text-amber-600",
  },
  purple: {
    bar: "bg-violet-500",
    icon: "bg-violet-50 text-violet-600",
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
    <div className="pro-card relative overflow-hidden rounded-[10px] p-3.5">
      <div className={`absolute left-0 top-0 h-[3px] w-full ${style.bar}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold leading-none text-slate-900">
            {value}
          </p>
          {subtitle ? (
            <p className="mt-1 text-[10px] text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        <div className={`shrink-0 rounded-lg p-2 ${style.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
