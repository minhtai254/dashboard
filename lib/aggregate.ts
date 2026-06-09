import type {
  BuyerDefectStat,
  DefectCategoryStat,
  DefectTypeStat,
  InspectionRecord,
  InspectionSummary,
  QtyGradeStat,
} from "./types";

function getDefectCategory(name: string): "S" | "D" | "N" | null {
  const match = name.match(/^\d+-([SDN])\./i);
  return match ? (match[1].toUpperCase() as "S" | "D" | "N") : null;
}

export function buildSummary(records: InspectionRecord[]): InspectionSummary {
  const totalQtyKgs = records.reduce((sum, row) => sum + row.qtyKgs, 0);
  const totalNetQtyKgs = records.reduce((sum, row) => sum + row.netQtyKgs, 0);
  const totalDefects = records.reduce((sum, row) => sum + row.totalDefect, 0);

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

export function buildBuyerStats(records: InspectionRecord[]): BuyerDefectStat[] {
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

    current.totalDefect += row.totalDefect;
    current.records += 1;
    current.qtyKgs += row.qtyKgs;
    map.set(buyer, current);
  }

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      defectRate: item.qtyKgs > 0 ? (item.totalDefect / item.qtyKgs) * 100 : 0,
    }))
    .sort((a, b) => b.totalDefect - a.totalDefect);
}

export function buildDefectCategoryStats(
  records: InspectionRecord[]
): DefectCategoryStat[] {
  const totals = { S: 0, D: 0, N: 0 };

  for (const row of records) {
    for (const [name, value] of Object.entries(row.defects)) {
      const category = getDefectCategory(name);
      if (category) totals[category] += value;
    }
  }

  const categories: DefectCategoryStat[] = [
    { category: "S", label: "Sợi (S)", value: totals.S },
    { category: "D", label: "Dệt (D)", value: totals.D },
    { category: "N", label: "Nhuộm (N)", value: totals.N },
  ];
  return categories.filter((item) => item.value > 0);
}

export function buildQtyGradeStats(records: InspectionRecord[]): QtyGradeStat[] {
  const totals = { A: 0, B: 0, C: 0, X: 0 };

  for (const row of records) {
    totals.A += row.qtyKgsA;
    totals.B += row.qtyKgsB;
    totals.C += row.qtyKgsC;
    totals.X += row.qtyKgsX;
  }

  const grades: QtyGradeStat[] = [
    { grade: "A", label: "Grade A", value: totals.A },
    { grade: "B", label: "Grade B", value: totals.B },
    { grade: "C", label: "Grade C", value: totals.C },
    { grade: "X", label: "Grade X", value: totals.X },
  ];
  return grades.filter((item) => item.value > 0);
}

export function buildDefectTypeStats(records: InspectionRecord[]): DefectTypeStat[] {
  const map = new Map<string, number>();

  for (const row of records) {
    for (const [name, value] of Object.entries(row.defects)) {
      map.set(name, (map.get(name) ?? 0) + value);
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}
