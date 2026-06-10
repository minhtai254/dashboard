"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DefectCategoryStat } from "@/lib/types";
import type { DefectCategoryFilter } from "@/lib/chartFilters";
import { CATEGORY_COLORS, CATEGORY_LEGEND_TEXT, chartPieLabelFontSize, pieChartAnimation, tooltipStyle } from "@/lib/chartTheme";
import { formatNumber } from "@/lib/format";

const ALL_CATEGORIES: DefectCategoryStat[] = [
  { category: "S", label: "Sợi (S)", value: 0 },
  { category: "D", label: "Đan (D)", value: 0 },
  { category: "N", label: "Nhuộm (N)", value: 0 },
];

interface DefectCategoryChartProps {
  data: DefectCategoryStat[];
  selectedCategory?: DefectCategoryFilter | null;
  onCategorySelect?: (category: DefectCategoryFilter) => void;
  onClear?: () => void;
}

function CategoryLegend({
  items,
  selectedCategory,
  onSelect,
}: {
  items: DefectCategoryStat[];
  selectedCategory?: DefectCategoryFilter | null;
  onSelect?: (category: DefectCategoryFilter) => void;
}) {
  return (
    <div className="defect-category-legend flex shrink-0 flex-wrap justify-center gap-x-3 gap-y-1 px-1 pb-0.5 text-[11px] font-medium leading-4">
      {items.map((item) => {
        const color = CATEGORY_LEGEND_TEXT[item.category];
        const content = (
          <>
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
            />
            <span style={{ color }}>{item.label}</span>
          </>
        );

        if (!onSelect) {
          return (
            <span key={item.category} className="inline-flex items-center gap-1.5">
              {content}
            </span>
          );
        }

        return (
          <button
            key={item.category}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.category);
            }}
            className={`inline-flex items-center gap-1.5 transition-opacity ${
              selectedCategory && selectedCategory !== item.category ? "opacity-40" : "opacity-100"
            }`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function DefectCategoryChart({
  data,
  selectedCategory = null,
  onCategorySelect,
  onClear,
}: DefectCategoryChartProps) {
  const legendItems = ALL_CATEGORIES.map((item) => ({
    ...item,
    value: data.find((entry) => entry.category === item.category)?.value ?? 0,
  }));

  const pieData = legendItems.filter((item) => item.value > 0);
  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-full min-h-[80px] items-center justify-center text-xs text-slate-500">
        Không có dữ liệu lỗi
      </div>
    );
  }

  const handleSelect = (category: DefectCategoryFilter) => {
    onCategorySelect?.(category);
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
        if (!selectedCategory || !onClear) return;
        const target = e.target as Element;
        if (target.closest(".recharts-sector")) return;
        if (target.closest(".defect-category-legend")) return;
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
              className={onCategorySelect ? "cursor-pointer outline-none" : undefined}
              onClick={(_, index, event) => {
                event?.stopPropagation();
                const category = pieData[index]?.category;
                if (category) handleSelect(category);
              }}
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category]}
                  stroke={selectedCategory === entry.category ? "#ffffff" : "transparent"}
                  strokeWidth={selectedCategory === entry.category ? 2 : 0}
                  opacity={
                    selectedCategory && selectedCategory !== entry.category ? 0.4 : 1
                  }
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      <CategoryLegend
        items={legendItems}
        selectedCategory={selectedCategory}
        onSelect={onCategorySelect}
      />
    </div>
  );
}
