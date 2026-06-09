import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
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
  icon: Icon,
  accent = "blue",
}: KpiCardProps) {
  const style = accentConfig[accent];

  return (
    <div className="pro-card relative overflow-hidden rounded-[10px] px-3 py-2">
      <div className={`absolute left-0 top-0 h-[2px] w-full ${style.bar}`} />
      <div className="flex items-center justify-between gap-1.5">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-0.5 text-lg font-bold leading-none tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`shrink-0 rounded-md p-1 ${style.icon}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
