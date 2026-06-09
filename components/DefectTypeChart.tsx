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
import type { DefectTypeStat } from "@/lib/types";
import { PBI_COLORS, chartAxis, chartGrid, tooltipStyle } from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

interface DefectTypeChartProps {
  data: DefectTypeStat[];
}

function shortenLabel(name: string): string {
  const match = name.match(/^\d+-[A-Z]\.\s*(.+)$/i);
  if (match) {
    const label = match[1];
    return label.length > 26 ? `${label.slice(0, 26)}…` : label;
  }
  return name.length > 28 ? `${name.slice(0, 28)}…` : name;
}

export function DefectTypeChart({ data }: DefectTypeChartProps) {
  const chartData = data.map((item) => ({
    name: shortenLabel(item.name),
    fullName: item.name,
    value: item.value,
  }));

  const chartHeight = Math.max(280, chartData.length * 30 + 40);

  return (
    <div className="w-full overflow-visible" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 4, right: 52, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} horizontal={false} />
          <XAxis type="number" stroke={chartAxis} fontSize={11} />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            stroke={chartAxis}
            fontSize={10}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatNumber(value, 0), "Số lượng"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullName ?? ""
            }
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={PBI_COLORS[index % PBI_COLORS.length]} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
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
