import type { InspectionRecord } from "./types";

export type DefectCategoryFilter = "S" | "D" | "N";
export type QtyGradeFilter = "A" | "B" | "C" | "X";

export interface ChartFilterState {
  defectCategory: DefectCategoryFilter | null;
  qtyGrade: QtyGradeFilter | null;
  buyer: string | null;
  defectType: string | null;
}

export const EMPTY_CHART_FILTERS: ChartFilterState = {
  defectCategory: null,
  qtyGrade: null,
  buyer: null,
  defectType: null,
};

export function normalizeBuyerName(buyer: string | null | undefined): string {
  return buyer?.trim() || "Unknown";
}

/** Defect code prefix: e.g. 1-S → Sợi, 21-D.xxx → Đan, 14-N → Nhuộm */
export function getDefectCategory(name: string): DefectCategoryFilter | null {
  const match = name.trim().match(/^\d+-([SDN])/i);
  return match ? (match[1].toUpperCase() as DefectCategoryFilter) : null;
}

function recordHasDefectCategory(
  record: InspectionRecord,
  category: DefectCategoryFilter
): boolean {
  for (const [name, value] of Object.entries(record.defects)) {
    if (value <= 0) continue;
    if (getDefectCategory(name) === category) return true;
  }
  return false;
}

function recordHasQtyGrade(record: InspectionRecord, grade: QtyGradeFilter): boolean {
  const qtyByGrade: Record<QtyGradeFilter, number> = {
    A: record.qtyKgsA,
    B: record.qtyKgsB,
    C: record.qtyKgsC,
    X: record.qtyKgsX,
  };
  return qtyByGrade[grade] > 0;
}

function recordHasDefectType(record: InspectionRecord, defectType: string): boolean {
  return (record.defects[defectType] ?? 0) > 0;
}

export function hasActiveChartFilters(state: ChartFilterState): boolean {
  return (
    state.defectCategory !== null ||
    state.qtyGrade !== null ||
    state.buyer !== null ||
    state.defectType !== null
  );
}

export function applyChartFilters(
  records: InspectionRecord[],
  chartFilters: ChartFilterState
): InspectionRecord[] {
  const { defectCategory, qtyGrade, buyer, defectType } = chartFilters;
  if (!defectCategory && !qtyGrade && !buyer && !defectType) return records;

  return records.filter((row) => {
    if (defectCategory && !recordHasDefectCategory(row, defectCategory)) return false;
    if (qtyGrade && !recordHasQtyGrade(row, qtyGrade)) return false;
    if (buyer && normalizeBuyerName(row.buyer) !== buyer) return false;
    if (defectType && !recordHasDefectType(row, defectType)) return false;
    return true;
  });
}

export function applyChartFiltersExcept(
  records: InspectionRecord[],
  chartFilters: ChartFilterState,
  except: (keyof ChartFilterState)[] = []
): InspectionRecord[] {
  const active: ChartFilterState = { ...chartFilters };
  for (const key of except) {
    active[key] = null;
  }
  return applyChartFilters(records, active);
}
