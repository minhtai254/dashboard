"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DefectCategoryStat } from "@/lib/types";
import { CATEGORY_COLORS, tooltipStyle } from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

interface DefectCategoryChartProps {
  data: DefectCategoryStat[];
}

export function DefectCategoryChart({ data }: DefectCategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-slate-500">
        Không có dữ liệu lỗi
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full overflow-visible">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="42%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              labelLine={false}
              label={renderLabel}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, _name, props) => {
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                return [`${formatNumber(value, 0)} (${pct}%)`, props.payload.label];
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-xs font-medium text-slate-500">
        Tổng: {formatNumber(total, 0)} lỗi
      </p>
    </div>
  );
}
