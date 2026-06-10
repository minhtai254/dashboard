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
import {
  PBI_COLORS,
  chartAxis,
  chartAxisFontSize,
  chartBarLabelFontSize,
  chartGrid,
  tooltipStyle,
} from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

interface DefectTypeChartProps {
  data: DefectTypeStat[];
  selectedDefectType?: string | null;
  onDefectTypeSelect?: (defectType: string) => void;
  onClear?: () => void;
}

const LABEL_WIDTH = 148;
const VISIBLE_ROWS = 10;
const ROW_HEIGHT = 28;
const CHART_CHROME = 36;
const BAR_SIZE = 14;

function DefectYAxisTick({
  y = 0,
  payload,
  selectedDefectType,
  onSelect,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  selectedDefectType?: string | null;
  onSelect?: (defectType: string) => void;
}) {
  const defectType = payload?.value ?? "";
  const isSelected = selectedDefectType === defectType;
  const isDimmed = selectedDefectType && selectedDefectType !== defectType;

  return (
    <foreignObject x={0} y={y - 10} width={LABEL_WIDTH} height={20}>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(defectType)}
          className={`defect-type-chart-label block w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs leading-5 transition ${
            isSelected
              ? "font-semibold text-blue-700"
              : isDimmed
                ? "text-slate-400"
                : "text-slate-600 hover:text-blue-600"
          }`}
          title={defectType}
        >
          {defectType}
        </button>
      ) : (
        <div
          className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs leading-5 text-slate-600"
          title={defectType}
        >
          {defectType}
        </div>
      )}
    </foreignObject>
  );
}

export function DefectTypeChart({
  data,
  selectedDefectType = null,
  onDefectTypeSelect,
  onClear,
}: DefectTypeChartProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    fullName: item.name,
    value: item.value,
  }));

  const chartHeight = Math.max(
    chartData.length * ROW_HEIGHT + CHART_CHROME,
    VISIBLE_ROWS * ROW_HEIGHT + CHART_CHROME
  );

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      onClick={(e) => {
        if (!selectedDefectType || !onClear) return;
        const target = e.target as Element;
        if (target.closest(".recharts-bar-rectangle")) return;
        if (target.closest(".defect-type-chart-label")) return;
        onClear();
      }}
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        style={{ maxHeight: VISIBLE_ROWS * ROW_HEIGHT + CHART_CHROME }}
      >
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              barCategoryGap="8%"
              margin={{ left: 0, right: 52, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} horizontal={false} />
              <XAxis
                type="number"
                stroke={chartAxis}
                fontSize={chartAxisFontSize}
                tickFormatter={(v) => formatNumber(v, 0)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={LABEL_WIDTH}
                stroke={chartAxis}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={
                  <DefectYAxisTick
                    selectedDefectType={selectedDefectType}
                    onSelect={onDefectTypeSelect}
                  />
                }
                padding={{ top: 0, bottom: 0 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatNumber(value, 0), "Số lượng"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullName ?? ""
                }
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={BAR_SIZE}
                className={onDefectTypeSelect ? "cursor-pointer outline-none" : undefined}
                onClick={(entry) => {
                  const defectType = entry?.fullName ?? entry?.name;
                  if (defectType) onDefectTypeSelect?.(defectType);
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PBI_COLORS[index % PBI_COLORS.length]}
                    stroke={selectedDefectType === entry.name ? "#ffffff" : "transparent"}
                    strokeWidth={selectedDefectType === entry.name ? 2 : 0}
                    opacity={
                      selectedDefectType && selectedDefectType !== entry.name ? 0.4 : 1
                    }
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  fontSize={chartBarLabelFontSize}
                  fill="#334155"
                  formatter={(v: number) => formatNumber(v, 0)}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
