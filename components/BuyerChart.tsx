"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  buyerDefectRateColor,
  chartAxis,
  chartAxisFontSize,
  chartBarLabelFontSize,
  chartGrid,
  pieChartAnimation,
  tooltipStyle,
} from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

interface BuyerChartProps {
  data: BuyerDefectStat[];
  selectedBuyer?: string | null;
  onBuyerSelect?: (buyer: string) => void;
  onClear?: () => void;
}

const LABEL_WIDTH = 148;
const VISIBLE_ROWS = 10;
const ROW_HEIGHT = 28;
const CHART_CHROME = 44;
const RATE_LABEL_OFFSET = 12;
const BAR_SIZE = 14;
const RATE_LABEL_FONT_SIZE = 10;

interface BuyerChartRow {
  name: string;
  fullName: string;
  totalDefect: number;
  qtyKgs: number;
  defectRate: number;
  records: number;
}

const RATE_ANIMATION_MS = pieChartAnimation.animationDuration;

function useAnimatedNumber(target: number, duration = RATE_ANIMATION_MS): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const from = displayRef.current;
    if (Math.abs(from - target) < 0.001) return;

    const start = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = from + (target - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return display;
}

function RatePointLabel({
  x = 0,
  y = 0,
  value,
}: {
  x?: number;
  y?: number;
  value?: number;
}) {
  const animatedValue = useAnimatedNumber(value ?? 0);

  if (value == null) return null;

  const label = `${formatNumber(animatedValue)}%`;

  return (
    <text
      x={x}
      y={y - RATE_LABEL_OFFSET}
      fill={buyerDefectRateColor}
      fontSize={RATE_LABEL_FONT_SIZE}
      fontWeight={700}
      dominantBaseline="middle"
      textAnchor="middle"
      stroke="#ffffff"
      strokeWidth={3}
      paintOrder="stroke fill"
      pointerEvents="none"
    >
      {label}
    </text>
  );
}

export function BuyerChartLegend() {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-3 text-[10px] text-slate-600">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-800" />
        Tổng lỗi
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="relative inline-flex h-2.5 w-5 items-center">
          <span className="absolute h-px w-full bg-[#E66C37]" />
          <span className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#E66C37] ring-1 ring-white" />
        </span>
        Tỷ lệ lỗi (%)
      </span>
    </div>
  );
}

function BuyerYAxisTick({
  y = 0,
  payload,
  selectedBuyer,
  onSelect,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  selectedBuyer?: string | null;
  onSelect?: (buyer: string) => void;
}) {
  const buyer = payload?.value ?? "";
  const isSelected = selectedBuyer === buyer;
  const isDimmed = selectedBuyer && selectedBuyer !== buyer;

  return (
    <foreignObject x={0} y={y - 10} width={LABEL_WIDTH} height={20}>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(buyer)}
          className={`buyer-chart-label block w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs leading-5 transition ${
            isSelected
              ? "font-semibold text-blue-700"
              : isDimmed
                ? "text-slate-400"
                : "text-slate-600 hover:text-blue-600"
          }`}
          title={buyer}
        >
          {buyer}
        </button>
      ) : (
        <div
          className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs leading-5 text-slate-600"
          title={buyer}
        >
          {buyer}
        </div>
      )}
    </foreignObject>
  );
}

export function BuyerChart({
  data,
  selectedBuyer = null,
  onBuyerSelect,
  onClear,
}: BuyerChartProps) {
  const chartData = useMemo<BuyerChartRow[]>(
    () =>
      [...data]
        .sort((a, b) => b.qtyKgs - a.qtyKgs)
        .map((item) => ({
          name: item.buyer,
          fullName: item.buyer,
          totalDefect: item.totalDefect,
          qtyKgs: item.qtyKgs,
          defectRate: Number(item.defectRate.toFixed(2)),
          records: item.records,
        })),
    [data]
  );

  const chartHeight = Math.max(
    chartData.length * ROW_HEIGHT + CHART_CHROME,
    VISIBLE_ROWS * ROW_HEIGHT + CHART_CHROME
  );

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      onClick={(e) => {
        if (!selectedBuyer || !onClear) return;
        const target = e.target as Element;
        if (target.closest(".recharts-bar-rectangle")) return;
        if (target.closest(".buyer-chart-label")) return;
        onClear();
      }}
    >
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
              margin={{ left: 0, right: 64, top: 18, bottom: 8 }}
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
                tick={
                  <BuyerYAxisTick
                    selectedBuyer={selectedBuyer}
                    onSelect={onBuyerSelect}
                  />
                }
                padding={{ top: 10, bottom: 6 }}
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
                className={onBuyerSelect ? "cursor-pointer outline-none" : undefined}
                onClick={(entry) => {
                  const buyer = entry?.fullName ?? entry?.name;
                  if (buyer) onBuyerSelect?.(buyer);
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PBI_COLORS[index % PBI_COLORS.length]}
                    stroke={selectedBuyer === entry.name ? "#ffffff" : "transparent"}
                    strokeWidth={selectedBuyer === entry.name ? 2 : 0}
                    opacity={
                      selectedBuyer && selectedBuyer !== entry.name ? 0.4 : 1
                    }
                  />
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
                stroke={buyerDefectRateColor}
                strokeWidth={1.25}
                dot={false}
                activeDot={false}
                {...pieChartAnimation}
              />
              <Line
                xAxisId="rate"
                type="monotone"
                dataKey="defectRate"
                legendType="none"
                stroke="none"
                dot={{
                  r: 2.5,
                  fill: buyerDefectRateColor,
                  stroke: "#ffffff",
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 3.5,
                  fill: buyerDefectRateColor,
                  stroke: "#ffffff",
                  strokeWidth: 1.5,
                }}
                {...pieChartAnimation}
              />
              <Line
                xAxisId="rate"
                type="monotone"
                dataKey="defectRate"
                legendType="none"
                stroke="none"
                dot={false}
                activeDot={false}
                {...pieChartAnimation}
              >
                <LabelList
                  dataKey="defectRate"
                  content={(props) => <RatePointLabel {...props} />}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
