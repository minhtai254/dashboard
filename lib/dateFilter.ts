import type { InspectionRecord } from "./types";

export interface DateFilterState {
  from: string | null;
  to: string | null;
}

export const EMPTY_DATE_FILTER: DateFilterState = {
  from: null,
  to: null,
};

export function hasActiveDateFilter(filter: DateFilterState): boolean {
  return Boolean(filter.from);
}

export function formatDateFilterLabel(filter: DateFilterState): string {
  if (!filter.from) return "";

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${iso}T00:00:00`));

  const end = filter.to ?? filter.from;
  if (end === filter.from) return fmt(filter.from);
  return `${fmt(filter.from)} – ${fmt(end)}`;
}

export function recordMatchesDateFilter(
  record: InspectionRecord,
  filter: DateFilterState
): boolean {
  if (!filter.from) return true;

  const date = record.inspectionDate?.slice(0, 10);
  if (!date) return false;

  const end = filter.to ?? filter.from;
  return date >= filter.from && date <= end;
}

export function isDateInRange(
  iso: string,
  filter: DateFilterState
): boolean {
  if (!filter.from) return false;
  const end = filter.to ?? filter.from;
  return iso >= filter.from && iso <= end;
}

export function isRangeEdge(iso: string, filter: DateFilterState): "start" | "end" | "both" | null {
  if (!filter.from) return null;
  const end = filter.to ?? filter.from;
  if (iso === filter.from && iso === end) return "both";
  if (iso === filter.from) return "start";
  if (iso === end) return "end";
  return null;
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseSheetDate(value: string | undefined): string {
  if (!value?.trim()) return "";

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);

  const dmy = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (dmy) {
    const day = dmy[1].padStart(2, "0");
    const month = dmy[2].padStart(2, "0");
    return `${dmy[3]}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return "";
}
