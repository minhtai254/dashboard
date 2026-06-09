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
  headerExtra?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  icon: Icon = BarChart2,
  accent = "from-blue-500 to-blue-600",
  headerExtra,
}: ChartCardProps) {
  return (
    <div className={`pro-card flex min-h-0 flex-col overflow-hidden rounded-[10px] ${className}`}>
      <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-100 px-4 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className={`shrink-0 rounded-lg bg-gradient-to-br ${accent} p-1.5`}>
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0 flex-1 truncate">
            <h3 className="truncate whitespace-nowrap leading-tight">
              <span className="text-sm font-bold text-slate-800">{title}</span>
              {subtitle ? (
                <>
                  <span className="mx-1.5 text-[10px] text-slate-400">·</span>
                  <span className="text-[10px] font-normal text-slate-500">{subtitle}</span>
                </>
              ) : null}
            </h3>
          </div>
        </div>
        {headerExtra}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-2 py-2">{children}</div>
    </div>
  );
}
