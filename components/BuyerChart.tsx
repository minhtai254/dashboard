"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
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
  chartAxisFontSize,
  chartBarLabelFontSize,
  chartGrid,
  tooltipStyle,
} from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

interface BuyerChartProps {
  data: BuyerDefectStat[];
}

const LABEL_WIDTH = 148;
const VISIBLE_ROWS = 10;
const ROW_HEIGHT = 28;
const CHART_CHROME = 36;
const BAR_SIZE = 14;

export function BuyerChartLegend() {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-3 text-[10px] text-slate-600">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-800" />
        Tổng lỗi
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="relative inline-flex h-2.5 w-5 items-center">
          <span className="absolute h-0.5 w-full bg-[#E66C37]" />
          <span className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#E66C37]" />
        </span>
        Tỷ lệ lỗi (%)
      </span>
    </div>
  );
}

function BuyerYAxisTick({
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  return (
    <foreignObject x={0} y={y - 10} width={LABEL_WIDTH} height={20}>
      <div
        className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs leading-5 text-slate-600"
        title={payload?.value}
      >
        {payload?.value}
      </div>
    </foreignObject>
  );
}

export function BuyerChart({ data }: BuyerChartProps) {
  const chartData = data.map((item) => ({
    name: item.buyer,
    fullName: item.buyer,
    totalDefect: item.totalDefect,
    defectRate: Number(item.defectRate.toFixed(2)),
    records: item.records,
  }));

  const chartHeight = Math.max(
    chartData.length * ROW_HEIGHT + CHART_CHROME,
    VISIBLE_ROWS * ROW_HEIGHT + CHART_CHROME
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ maxHeight: VISIBLE_ROWS * ROW_HEIGHT + CHART_CHROME }}
      >
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ComposedChart
              data={chartData}
              layout="vertical"
              barCategoryGap="8%"
              margin={{ left: 0, right: 52, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} horizontal={false} />
              <XAxis
                type="number"
                xAxisId="defect"
                stroke={chartAxis}
                fontSize={chartAxisFontSize}
                tickFormatter={(v) => formatNumber(v, 0)}
              />
              <XAxis type="number" xAxisId="rate" orientation="top" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={LABEL_WIDTH}
                stroke={chartAxis}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={<BuyerYAxisTick />}
                padding={{ top: 0, bottom: 0 }}
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
              <Bar
                xAxisId="defect"
                dataKey="totalDefect"
                name="totalDefect"
                radius={[0, 4, 4, 0]}
                barSize={BAR_SIZE}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={PBI_COLORS[index % PBI_COLORS.length]} />
                ))}
                <LabelList
                  dataKey="totalDefect"
                  position="right"
                  fontSize={chartBarLabelFontSize}
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
      </div>
    </div>
  );
}
