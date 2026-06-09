export interface InspectionRecord {
  buyer: string;
  ocNo: string;
  jobOrderNo: string;
  dyeingLot: string;
  fpo: string;
  fppo: string;
  articleName: string;
  articleDesc: string;
  color: string;
  size: string;
  uom: string;
  greigeRoll: number;
  greigeQty: number;
  lotNo: string;
  totalRoll: number;
  qtyKgs: number;
  netQtyKgs: number;
  qtyKgsA: number;
  qtyKgsB: number;
  qtyKgsC: number;
  qtyKgsX: number;
  qtyMtr: number;
  netQtyMtr: number;
  qtyMtrA: number;
  qtyMtrB: number;
  qtyMtrC: number;
  qtyMtrX: number;
  totalDefect: number;
  inspectionDate: string;
  defects: Record<string, number>;
}

export interface InspectionSummary {
  totalRecords: number;
  totalDefects: number;
  totalQtyKgs: number;
  totalNetQtyKgs: number;
  defectRate: number;
  uniqueBuyers: number;
  uniqueLots: number;
}

export interface BuyerDefectStat {
  buyer: string;
  totalDefect: number;
  records: number;
  qtyKgs: number;
  defectRate: number;
}

export interface DefectTypeStat {
  name: string;
  value: number;
}

export interface DefectCategoryStat {
  category: "S" | "D" | "N";
  label: string;
  value: number;
}

export interface QtyGradeStat {
  grade: "A" | "B" | "C" | "X";
  label: string;
  value: number;
}

export interface InspectionData {
  records: InspectionRecord[];
  summary: InspectionSummary;
  byBuyer: BuyerDefectStat[];
  topDefectTypes: DefectTypeStat[];
  byDefectCategory: DefectCategoryStat[];
  byQtyGrade: QtyGradeStat[];
  fetchedAt: string;
  source: {
    sheetId: string;
    sheetTab: string;
    url: string;
  };
}
