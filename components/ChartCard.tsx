import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { BarChart2 } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
  accent?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  icon: Icon = BarChart2,
  accent = "from-blue-500 to-blue-600",
}: ChartCardProps) {
  return (
    <div className={`pro-card overflow-visible rounded-[10px] ${className}`}>
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-2.5">
        <div className={`rounded-md bg-gradient-to-br ${accent} p-1.5`}>
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800">{title}</h3>
          {subtitle ? (
            <p className="text-[10px] text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="overflow-visible px-4 py-3">{children}</div>
    </div>
  );
}
