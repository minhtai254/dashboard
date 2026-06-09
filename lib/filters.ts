import type { InspectionRecord } from "./types";

export interface DashboardFilters {
  buyer: string;
  ocNo: string;
  jobOrderNo: string;
  lotNo: string;
}

export const EMPTY_FILTERS: DashboardFilters = {
  buyer: "",
  ocNo: "",
  jobOrderNo: "",
  lotNo: "",
};

export type FilterField = keyof DashboardFilters;

export const FILTER_LABELS: Record<FilterField, string> = {
  buyer: "Buyer",
  ocNo: "OC",
  jobOrderNo: "OD No",
  lotNo: "Lot",
};

export function hasActiveFilters(filters: DashboardFilters): boolean {
  return Object.values(filters).some((value) => value.trim() !== "");
}

export function filterRecords(
  records: InspectionRecord[],
  filters: DashboardFilters
): InspectionRecord[] {
  const buyer = filters.buyer.trim().toLowerCase();
  const ocNo = filters.ocNo.trim().toLowerCase();
  const jobOrderNo = filters.jobOrderNo.trim().toLowerCase();
  const lotNo = filters.lotNo.trim().toLowerCase();

  return records.filter((row) => {
    if (buyer && !row.buyer.toLowerCase().includes(buyer)) return false;
    if (ocNo && !row.ocNo.toLowerCase().includes(ocNo)) return false;
    if (jobOrderNo && !row.jobOrderNo.toLowerCase().includes(jobOrderNo)) return false;
    if (lotNo && !row.lotNo.toLowerCase().includes(lotNo)) return false;
    return true;
  });
}

export function getUniqueValues(
  records: InspectionRecord[],
  field: FilterField
): string[] {
  return Array.from(
    new Set(records.map((row) => row[field]?.trim()).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "vi"));
}

export function getScopedRecords(
  records: InspectionRecord[],
  filters: DashboardFilters,
  excludeField?: FilterField
): InspectionRecord[] {
  const scopedFilters = { ...filters };
  if (excludeField) scopedFilters[excludeField] = "";
  return filterRecords(records, scopedFilters);
}

export function getSuggestions(
  records: InspectionRecord[],
  field: FilterField,
  query: string,
  filters: DashboardFilters = EMPTY_FILTERS,
  limit = 15
): { items: string[]; total: number } {
  const scoped = getScopedRecords(records, filters, field);
  const values = getUniqueValues(scoped, field);
  const q = query.trim().toLowerCase();

  const matched = q
    ? values.filter((value) => value.toLowerCase().includes(q))
    : values;

  return {
    items: matched.slice(0, limit),
    total: matched.length,
  };
}
