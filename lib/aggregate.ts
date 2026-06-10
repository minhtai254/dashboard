import type {
  BuyerDefectStat,
  DefectCategoryStat,
  DefectTypeStat,
  InspectionRecord,
  InspectionSummary,
  QtyGradeStat,
} from "./types";
import { getDefectCategory, type DefectCategoryFilter } from "./chartFilters";

function defectMatchesCategory(
  name: string,
  value: number,
  categoryFilter?: DefectCategoryFilter | null
): boolean {
  if (value <= 0) return false;
  if (!categoryFilter) return true;
  return getDefectCategory(name) === categoryFilter;
}

function sumFilteredDefects(
  record: InspectionRecord,
  categoryFilter?: DefectCategoryFilter | null,
  defectTypeFilter?: string | null
): number {
  if (defectTypeFilter) {
    const value = record.defects[defectTypeFilter] ?? 0;
    if (value <= 0) return 0;
    if (categoryFilter && getDefectCategory(defectTypeFilter) !== categoryFilter) return 0;
    return value;
  }

  let sum = 0;
  for (const [name, value] of Object.entries(record.defects)) {
    if (defectMatchesCategory(name, value, categoryFilter)) {
      sum += value;
    }
  }
  return sum;
}

export function buildSummary(
  records: InspectionRecord[],
  defectCategoryFilter?: DefectCategoryFilter | null,
  defectTypeFilter?: string | null
): InspectionSummary {
  const totalQtyKgs = records.reduce((sum, row) => sum + row.qtyKgs, 0);
  const totalNetQtyKgs = records.reduce((sum, row) => sum + row.netQtyKgs, 0);
  const totalDefects = records.reduce(
    (sum, row) => sum + sumFilteredDefects(row, defectCategoryFilter, defectTypeFilter),
    0
  );

  return {
    totalRecords: records.length,
    totalDefects,
    totalQtyKgs,
    totalNetQtyKgs,
    defectRate: totalQtyKgs > 0 ? (totalDefects / totalQtyKgs) * 100 : 0,
    uniqueBuyers: new Set(records.map((row) => row.buyer).filter(Boolean)).size,
    uniqueLots: new Set(records.map((row) => row.lotNo).filter(Boolean)).size,
  };
}

export function buildBuyerStats(
  records: InspectionRecord[],
  defectCategoryFilter?: DefectCategoryFilter | null,
  defectTypeFilter?: string | null
): BuyerDefectStat[] {
  const map = new Map<string, BuyerDefectStat>();

  for (const row of records) {
    const buyer = row.buyer || "Unknown";
    const current = map.get(buyer) ?? {
      buyer,
      totalDefect: 0,
      records: 0,
      qtyKgs: 0,
      defectRate: 0,
    };

    current.totalDefect += sumFilteredDefects(row, defectCategoryFilter, defectTypeFilter);
    current.records += 1;
    current.qtyKgs += row.qtyKgs;
    map.set(buyer, current);
  }

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      defectRate: item.qtyKgs > 0 ? (item.totalDefect / item.qtyKgs) * 100 : 0,
    }))
    .sort((a, b) => b.qtyKgs - a.qtyKgs);
}

export function buildDefectCategoryStats(
  records: InspectionRecord[],
  defectCategoryFilter?: DefectCategoryFilter | null,
  showAllCategories = false
): DefectCategoryStat[] {
  const totals = { S: 0, D: 0, N: 0 };

  for (const row of records) {
    for (const [name, value] of Object.entries(row.defects)) {
      if (!defectMatchesCategory(name, value, defectCategoryFilter)) continue;
      const category = getDefectCategory(name);
      if (category) totals[category] += value;
    }
  }

  const categories: DefectCategoryStat[] = [
    { category: "S", label: "Sợi (S)", value: totals.S },
    { category: "D", label: "Đan (D)", value: totals.D },
    { category: "N", label: "Nhuộm (N)", value: totals.N },
  ];
  return showAllCategories ? categories : categories.filter((item) => item.value > 0);
}

export function buildQtyGradeStats(
  records: InspectionRecord[],
  showAllGrades = false,
  weightByDefectCategory?: DefectCategoryFilter | null
): QtyGradeStat[] {
  const totals = { A: 0, B: 0, C: 0, X: 0 };

  for (const row of records) {
    if (weightByDefectCategory) {
      let categoryDefects = 0;
      let totalDefects = 0;
      for (const [name, value] of Object.entries(row.defects)) {
        if (value <= 0) continue;
        totalDefects += value;
        if (getDefectCategory(name) === weightByDefectCategory) {
          categoryDefects += value;
        }
      }
      if (categoryDefects <= 0) continue;
      const weight = categoryDefects / totalDefects;
      totals.A += row.qtyKgsA * weight;
      totals.B += row.qtyKgsB * weight;
      totals.C += row.qtyKgsC * weight;
      totals.X += row.qtyKgsX * weight;
    } else {
      totals.A += row.qtyKgsA;
      totals.B += row.qtyKgsB;
      totals.C += row.qtyKgsC;
      totals.X += row.qtyKgsX;
    }
  }

  const grades: QtyGradeStat[] = [
    { grade: "A", label: "Grade A", value: totals.A },
    { grade: "B", label: "Grade B", value: totals.B },
    { grade: "C", label: "Grade C", value: totals.C },
    { grade: "X", label: "Grade X", value: totals.X },
  ];
  return showAllGrades ? grades : grades.filter((item) => item.value > 0);
}

export function buildDefectTypeStats(
  records: InspectionRecord[],
  defectCategoryFilter?: DefectCategoryFilter | null
): DefectTypeStat[] {
  const map = new Map<string, number>();

  for (const row of records) {
    for (const [name, value] of Object.entries(row.defects)) {
      if (!defectMatchesCategory(name, value, defectCategoryFilter)) continue;
      map.set(name, (map.get(name) ?? 0) + value);
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
