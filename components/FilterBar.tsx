"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  ChevronDown,
  FileText,
  Hash,
  Layers,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InspectionRecord } from "@/lib/types";
import { DateFilterPicker } from "@/components/DateFilterPicker";
import {
  EMPTY_DATE_FILTER,
  hasActiveDateFilter,
  type DateFilterState,
} from "@/lib/dateFilter";
import {
  EMPTY_FILTERS,
  FILTER_LABELS,
  type DashboardFilters,
  type FilterField,
  getSuggestions,
  hasActiveFilters,
} from "@/lib/filters";

interface FilterBarProps {
  records: InspectionRecord[];
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  dateFilter: DateFilterState;
  onDateChange: (dateFilter: DateFilterState) => void;
  chartFiltersActive?: boolean;
  onClearChartFilters?: () => void;
}

const FILTER_FIELDS: FilterField[] = ["buyer", "ocNo", "jobOrderNo", "lotNo"];

const FIELD_ICONS: Record<FilterField, LucideIcon> = {
  buyer: Building2,
  ocNo: FileText,
  jobOrderNo: Hash,
  lotNo: Layers,
};

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

function FilterFieldInput({
  field,
  value,
  records,
  filters,
  onChange,
}: {
  field: FilterField;
  value: string;
  records: InspectionRecord[];
  filters: DashboardFilters;
  onChange: (field: FilterField, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = FIELD_ICONS[field];

  const { items: suggestions } = useMemo(
    () => getSuggestions(records, field, value, filters),
    [records, field, value, filters]
  );

  const isActive = value.trim() !== "";

  const setDropdownOpen = (next: boolean) => {
    setOpen(next);
    if (!next) setHighlight(-1);
  };

  const updatePosition = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      const portal = document.getElementById(`filter-dropdown-${field}`);
      if (portal?.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [field]);

  const apply = (next: string) => {
    onChange(field, next);
    setDropdownOpen(false);
  };

  const dropdown =
    open && suggestions.length > 0 && position ? (
      <div
        id={`filter-dropdown-${field}`}
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          width: position.width,
          zIndex: 9999,
        }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
      >
        <ul className="max-h-52 overflow-auto py-1">
          {suggestions.map((item, index) => (
            <li key={item}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => apply(item)}
                className={`w-full px-3 py-2 text-left text-xs transition ${
                  index === highlight
                    ? "bg-blue-50 text-blue-700"
                    : value === item
                      ? "font-medium text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div ref={ref} className="relative min-w-0 w-full">
      <Icon className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <div className="relative">
        <input
          value={value}
          onChange={(e) => {
            onChange(field, e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && suggestions.length > 0) {
              e.preventDefault();
              setDropdownOpen(true);
              setHighlight((i) => (i + 1) % suggestions.length);
              return;
            }
            if (!open || suggestions.length === 0) return;
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
            } else if (e.key === "Enter" && highlight >= 0) {
              e.preventDefault();
              apply(suggestions[highlight]);
            } else if (e.key === "Escape") {
              setDropdownOpen(false);
            }
          }}
          placeholder={FILTER_LABELS[field]}
          className={`h-9 w-full rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-14 text-sm outline-none transition ${
            isActive
              ? "border-blue-400 bg-blue-50/60 ring-1 ring-blue-200"
              : "hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-200"
          }`}
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {value ? (
            <button
              type="button"
              onClick={() => onChange(field, "")}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDropdownOpen(!open)}
            className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}

export function FilterBar({
  records,
  filters,
  onChange,
  dateFilter,
  onDateChange,
  chartFiltersActive = false,
  onClearChartFilters,
}: FilterBarProps) {
  const active =
    hasActiveFilters(filters) || hasActiveDateFilter(dateFilter) || chartFiltersActive;

  return (
    <div className="pro-card relative z-30 overflow-visible rounded-[10px] px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <DateFilterPicker
            value={dateFilter}
            onChange={onDateChange}
            records={records}
            className="relative min-w-0 w-full flex-1"
          />

          <div className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />

          <div className="grid min-w-0 flex-[4] grid-cols-4 gap-2">
            {FILTER_FIELDS.map((field) => (
              <FilterFieldInput
                key={field}
                field={field}
                value={filters[field]}
                records={records}
                filters={filters}
                onChange={(f, v) => onChange({ ...filters, [f]: v })}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onChange(EMPTY_FILTERS);
            onDateChange(EMPTY_DATE_FILTER);
            onClearChartFilters?.();
          }}
          className={`inline-flex shrink-0 items-center gap-0.5 text-[10px] font-medium transition ${
            active
              ? "text-slate-500 hover:text-red-600"
              : "pointer-events-none invisible"
          }`}
          tabIndex={active ? 0 : -1}
          aria-hidden={!active}
        >
          <X className="h-3 w-3" />
          Xóa lọc
        </button>
      </div>
    </div>
  );
}
