"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { QtyGradeStat } from "@/lib/types";
import { GRADE_COLORS, chartAxis, chartGrid, tooltipStyle } from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

interface QtyGradeChartProps {
  data: QtyGradeStat[];
}

export function QtyGradeChart({ data }: QtyGradeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
        Không có dữ liệu grade
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = data.map((item) => ({
    ...item,
    percent: total > 0 ? (item.value / total) * 100 : 0,
  }));

  return (
    <div className="h-[240px] w-full overflow-visible">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 28, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
          <XAxis
            dataKey="label"
            stroke={chartAxis}
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke={chartAxis}
            fontSize={11}
            tickFormatter={(v) => formatNumber(v, 0)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, _name, props) => {
              const pct = props.payload.percent?.toFixed(1) ?? "0";
              return [`${formatNumber(value)} Kgs (${pct}%)`, "Sản lượng"];
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
            {chartData.map((entry) => (
              <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade]} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              fontSize={10}
              fill="#334155"
              formatter={(v: number) => formatNumber(v, 0)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
