"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { InspectionRecord } from "@/lib/types";
import {
  EMPTY_DATE_FILTER,
  formatDateFilterLabel,
  isDateInRange,
  isRangeEdge,
  toIsoDate,
  type DateFilterState,
} from "@/lib/dateFilter";

interface DateFilterPickerProps {
  value: DateFilterState;
  onChange: (value: DateFilterState) => void;
  records: InspectionRecord[];
  className?: string;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function getTodayIso(): string {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function getDayClassName(
  iso: string,
  value: DateFilterState,
  hasData: boolean,
  todayIso: string
): string {
  const inRange = isDateInRange(iso, value);
  const edge = isRangeEdge(iso, value);
  const isToday = iso === todayIso;
  const isRange = value.from && value.to && value.from !== value.to;

  if (edge === "both") {
    return "rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white shadow-md shadow-blue-500/25";
  }

  if (edge === "start" && isRange) {
    return "rounded-l-lg rounded-r-none bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white shadow-md shadow-blue-500/20";
  }

  if (edge === "end" && isRange) {
    return "rounded-r-lg rounded-l-none bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white shadow-md shadow-blue-500/20";
  }

  if (inRange) {
    return "rounded-none bg-blue-50 font-medium text-blue-700";
  }

  if (hasData) {
    return "rounded-lg font-medium text-slate-700 hover:bg-slate-100";
  }

  if (isToday) {
    return "rounded-lg font-semibold text-blue-600 ring-1 ring-blue-200 hover:bg-blue-50";
  }

  return "rounded-lg text-slate-600 hover:bg-slate-50";
}

export function DateFilterPicker({
  value,
  onChange,
  records,
  className = "relative min-w-0 w-full",
}: DateFilterPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const ref = useRef<HTMLDivElement>(null);
  const todayIso = getTodayIso();

  const availableDates = useMemo(
    () =>
      new Set(
        records.map((row) => row.inspectionDate).filter(Boolean) as string[]
      ),
    [records]
  );

  const isActive = Boolean(value.from);

  useEffect(() => {
    if (!open) return;
    if (value.from) {
      setViewMonth(new Date(`${value.from}T00:00:00`));
    }
  }, [open, value.from]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (ref.current?.contains(target)) return;
      const portal = document.getElementById("date-filter-dropdown");
      if (portal?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthLabel = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const cells: Array<{ iso: string; day: number } | null> = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ iso: toIsoDate(year, month, day), day });
    }
    return cells;
  }, [viewMonth]);

  const handleDayClick = (iso: string) => {
    const { from, to } = value;

    if (!from || (from && to && from !== to)) {
      onChange({ from: iso, to: iso });
      return;
    }

    if (from === to && iso !== from) {
      onChange(iso < from ? { from: iso, to: from } : { from, to: iso });
      return;
    }

    onChange({ from: iso, to: iso });
  };

  const dropdown = open ? (
    <div
      id="date-filter-dropdown"
      style={{
        position: "fixed",
        top: ref.current ? ref.current.getBoundingClientRect().bottom + 6 : 0,
        left: ref.current?.getBoundingClientRect().left ?? 0,
        zIndex: 9999,
      }}
      className="w-[264px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-100"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-3 py-2.5">
        <button
          type="button"
          onClick={() => setViewMonth((current) => addMonths(current, -1))}
          className="rounded-lg border border-transparent p-1 text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold capitalize tracking-wide text-slate-800">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth((current) => addMonths(current, 1))}
          className="rounded-lg border border-transparent p-1 text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="pb-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 pb-3">
          {calendarDays.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="h-9" />;
            }

            const hasData = availableDates.has(cell.iso);
            const inRange = isDateInRange(cell.iso, value);
            const edge = isRangeEdge(cell.iso, value);

            return (
              <button
                key={cell.iso}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleDayClick(cell.iso)}
                className={`relative flex h-9 items-center justify-center text-xs transition ${getDayClassName(
                  cell.iso,
                  value,
                  hasData,
                  todayIso
                )}`}
              >
                {cell.day}
                {hasData && !inRange && !edge ? (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div ref={ref} className={className}>
      <Calendar className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={`flex h-9 w-full items-center rounded-lg border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-14 text-left text-sm outline-none transition ${
            isActive
              ? "border-blue-400 bg-blue-50/60 ring-1 ring-blue-200"
              : open
                ? "border-blue-400 bg-white ring-1 ring-blue-200"
                : "hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-200"
          }`}
        >
          <span className={`truncate ${isActive ? "text-slate-800" : "text-slate-400"}`}>
            {isActive ? formatDateFilterLabel(value) : "Date"}
          </span>
        </button>
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {isActive ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(EMPTY_DATE_FILTER);
              }}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
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
