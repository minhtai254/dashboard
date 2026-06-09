"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BuyerDefectStat } from "@/lib/types";
import {
  PBI_COLORS,
  chartAxis,
  chartGrid,
  tooltipStyle,
} from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

interface BuyerChartProps {
  data: BuyerDefectStat[];
}

export function BuyerChart({ data }: BuyerChartProps) {
  const chartData = data.slice(0, 8).map((item) => ({
    name: item.buyer.length > 16 ? `${item.buyer.slice(0, 16)}…` : item.buyer,
    fullName: item.buyer,
    totalDefect: item.totalDefect,
    defectRate: Number(item.defectRate.toFixed(2)),
    records: item.records,
  }));

  const chartHeight = Math.max(260, chartData.length * 34 + 56);

  return (
    <div className="w-full overflow-visible" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          layout="vertical"
          margin={{ left: 4, right: 56, top: 4, bottom: 28 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} horizontal={false} />
          <XAxis
            type="number"
            xAxisId="defect"
            stroke={chartAxis}
            fontSize={11}
            tickFormatter={(v) => formatNumber(v, 0)}
          />
          <XAxis
            type="number"
            xAxisId="rate"
            orientation="top"
            stroke={chartAxis}
            fontSize={11}
            tickFormatter={(v) => `${v}%`}
            hide
          />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            stroke={chartAxis}
            fontSize={11}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, name: string) => {
              if (name === "totalDefect") return [formatNumber(value, 0), "Tổng lỗi"];
              if (name === "defectRate") return [`${formatNumber(value)}%`, "Tỷ lệ lỗi"];
              return [value, name];
            }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullName ?? ""
            }
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            formatter={(value) =>
              value === "totalDefect" ? "Tổng lỗi" : "Tỷ lệ lỗi (%)"
            }
          />
          <Bar
            xAxisId="defect"
            dataKey="totalDefect"
            name="totalDefect"
            radius={[0, 4, 4, 0]}
            barSize={16}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={PBI_COLORS[index % PBI_COLORS.length]} />
            ))}
            <LabelList
              dataKey="totalDefect"
              position="right"
              fontSize={10}
              fill="#334155"
              formatter={(v: number) => formatNumber(v, 0)}
            />
          </Bar>
          <Line
            xAxisId="rate"
            type="monotone"
            dataKey="defectRate"
            name="defectRate"
            stroke="#E66C37"
            strokeWidth={2}
            dot={{ r: 3, fill: "#E66C37", strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
