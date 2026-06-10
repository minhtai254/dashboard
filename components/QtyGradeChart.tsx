"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { QtyGradeStat } from "@/lib/types";
import type { QtyGradeFilter } from "@/lib/chartFilters";
import { GRADE_COLORS, GRADE_LEGEND_TEXT, chartPieLabelFontSize, pieChartAnimation, tooltipStyle } from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

const ALL_GRADES: QtyGradeStat[] = [
  { grade: "A", label: "Grade A", value: 0 },
  { grade: "B", label: "Grade B", value: 0 },
  { grade: "C", label: "Grade C", value: 0 },
  { grade: "X", label: "Grade X", value: 0 },
];

interface QtyGradeChartProps {
  data: QtyGradeStat[];
  selectedGrade?: QtyGradeFilter | null;
  onGradeSelect?: (grade: QtyGradeFilter) => void;
  onClear?: () => void;
}

function GradeLegend({
  items,
  selectedGrade,
  onSelect,
}: {
  items: QtyGradeStat[];
  selectedGrade?: QtyGradeFilter | null;
  onSelect?: (grade: QtyGradeFilter) => void;
}) {
  return (
    <div className="qty-grade-legend flex shrink-0 flex-wrap justify-center gap-x-3 gap-y-1 px-1 pb-0.5 text-[11px] font-medium leading-4">
      {items.map((item) => {
        const color = GRADE_LEGEND_TEXT[item.grade];
        const content = (
          <>
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: GRADE_COLORS[item.grade] }}
            />
            <span style={{ color }}>{item.label}</span>
          </>
        );

        if (!onSelect) {
          return (
            <span key={item.grade} className="inline-flex items-center gap-1.5">
              {content}
            </span>
          );
        }

        return (
          <button
            key={item.grade}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.grade);
            }}
            className={`inline-flex items-center gap-1.5 transition-opacity ${
              selectedGrade && selectedGrade !== item.grade ? "opacity-40" : "opacity-100"
            }`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function QtyGradeChart({
  data,
  selectedGrade = null,
  onGradeSelect,
  onClear,
}: QtyGradeChartProps) {
  const legendItems = ALL_GRADES.map((item) => ({
    ...item,
    value: data.find((entry) => entry.grade === item.grade)?.value ?? 0,
  }));

  const pieData = legendItems.filter((item) => item.value > 0);
  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-full min-h-[80px] items-center justify-center text-xs text-slate-500">
        Không có dữ liệu grade
      </div>
    );
  }

  const handleSelect = (grade: QtyGradeFilter) => {
    onGradeSelect?.(grade);
  };

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
        fontSize={chartPieLabelFontSize}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      onClick={(e) => {
        if (!selectedGrade || !onClear) return;
        const target = e.target as Element;
        if (target.closest(".recharts-sector")) return;
        if (target.closest(".qty-grade-legend")) return;
        onClear();
      }}
    >
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="46%"
              innerRadius="38%"
              outerRadius="68%"
              paddingAngle={2}
              labelLine={false}
              label={renderLabel}
              {...pieChartAnimation}
              className={onGradeSelect ? "cursor-pointer outline-none" : undefined}
              onClick={(_, index, event) => {
                event?.stopPropagation();
                const grade = pieData[index]?.grade;
                if (grade) handleSelect(grade);
              }}
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.grade}
                  fill={GRADE_COLORS[entry.grade]}
                  stroke={selectedGrade === entry.grade ? "#ffffff" : "transparent"}
                  strokeWidth={selectedGrade === entry.grade ? 2 : 0}
                  opacity={selectedGrade && selectedGrade !== entry.grade ? 0.4 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, _name, props) => {
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                return [`${formatNumber(value)} Kgs (${pct}%)`, props.payload.label];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <GradeLegend
        items={legendItems}
        selectedGrade={selectedGrade}
        onSelect={onGradeSelect}
      />
    </div>
  );
}
