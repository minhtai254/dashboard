import Papa from "papaparse";
import {
  buildBuyerStats,
  buildDefectCategoryStats,
  buildDefectTypeStats,
  buildQtyGradeStats,
  buildSummary,
} from "./aggregate";
import {
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_TAB,
  GOOGLE_SHEET_URL,
  REFRESH_INTERVAL_MS,
  getSheetCsvUrl,
} from "./config";
import { parseInspectionRows } from "./parse";
import type { InspectionData } from "./types";

export async function fetchInspectionData(): Promise<InspectionData> {
  const csvUrl = getSheetCsvUrl();
  const response = await fetch(csvUrl, {
    cache: "no-store",
    next: { revalidate: REFRESH_INTERVAL_MS / 1000 },
  });

  if (!response.ok) {
    throw new Error(
      `Không thể tải Google Sheet (HTTP ${response.status}). Kiểm tra quyền chia sẻ sheet.`
    );
  }

  const csvText = await response.text();
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    console.warn("CSV parse warnings:", parsed.errors.slice(0, 3));
  }

  const records = parseInspectionRows(parsed.data);

  return {
    records,
    summary: buildSummary(records),
    byBuyer: buildBuyerStats(records),
    topDefectTypes: buildDefectTypeStats(records),
    byDefectCategory: buildDefectCategoryStats(records),
    byQtyGrade: buildQtyGradeStats(records),
    fetchedAt: new Date().toISOString(),
    source: {
      sheetId: GOOGLE_SHEET_ID,
      sheetTab: GOOGLE_SHEET_TAB,
      url: GOOGLE_SHEET_URL,
    },
  };
}
