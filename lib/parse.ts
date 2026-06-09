import type { InspectionRecord } from "./types";

type ScalarField = Exclude<keyof InspectionRecord, "defects">;

const NUMERIC_FIELDS = new Set<ScalarField>([
  "greigeRoll",
  "greigeQty",
  "totalRoll",
  "qtyKgs",
  "netQtyKgs",
  "qtyKgsA",
  "qtyKgsB",
  "qtyKgsC",
  "qtyKgsX",
  "qtyMtr",
  "netQtyMtr",
  "qtyMtrA",
  "qtyMtrB",
  "qtyMtrC",
  "qtyMtrX",
  "totalDefect",
]);

const FIELD_MAP: Record<string, ScalarField> = {
  buyer: "buyer",
  ocno: "ocNo",
  joborderno: "jobOrderNo",
  dyeinglot: "dyeingLot",
  fpo: "fpo",
  fppo: "fppo",
  articlename: "articleName",
  articledesc: "articleDesc",
  color: "color",
  size: "size",
  uom: "uom",
  greigeroll: "greigeRoll",
  greigeqty: "greigeQty",
  lotno: "lotNo",
  totalroll: "totalRoll",
  qtykgs: "qtyKgs",
  netqtykgs: "netQtyKgs",
  qtykgsa: "qtyKgsA",
  qtykgsb: "qtyKgsB",
  qtykgsc: "qtyKgsC",
  qtykgsx: "qtyKgsX",
  qtymtr: "qtyMtr",
  netqtymtr: "netQtyMtr",
  qtymtra: "qtyMtrA",
  qtymtrb: "qtyMtrB",
  qtymtrc: "qtyMtrC",
  qtymtrx: "qtyMtrX",
  totaldefect: "totalDefect",
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "");
}

function parseNumber(value: string | undefined): number {
  if (!value || value.trim() === "") return 0;
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toFieldKey(header: string): ScalarField | null {
  const normalized = normalizeHeader(header);
  return FIELD_MAP[normalized] ?? null;
}

export function parseInspectionRows(
  rows: Record<string, string>[]
): InspectionRecord[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const mappedHeaders = new Map(
    headers.map((header) => [header, toFieldKey(header)])
  );
  const defectHeaders = headers.filter((header) => !toFieldKey(header));

  return rows
    .filter((row) => Object.values(row).some((cell) => cell?.trim()))
    .map((row) => {
      const record: InspectionRecord = {
        buyer: "",
        ocNo: "",
        jobOrderNo: "",
        dyeingLot: "",
        fpo: "",
        fppo: "",
        articleName: "",
        articleDesc: "",
        color: "",
        size: "",
        uom: "",
        greigeRoll: 0,
        greigeQty: 0,
        lotNo: "",
        totalRoll: 0,
        qtyKgs: 0,
        netQtyKgs: 0,
        qtyKgsA: 0,
        qtyKgsB: 0,
        qtyKgsC: 0,
        qtyKgsX: 0,
        qtyMtr: 0,
        netQtyMtr: 0,
        qtyMtrA: 0,
        qtyMtrB: 0,
        qtyMtrC: 0,
        qtyMtrX: 0,
        totalDefect: 0,
        defects: {},
      };

      for (const [header, value] of Object.entries(row)) {
        const field = mappedHeaders.get(header);
        if (field) {
          if (NUMERIC_FIELDS.has(field)) {
            (record[field] as number) = parseNumber(value);
          } else {
            (record[field] as string) = value?.trim() ?? "";
          }
        }
      }

      for (const header of defectHeaders) {
        const value = parseNumber(row[header]);
        if (value > 0) {
          record.defects[header] = value;
        }
      }

      return record;
    });
}
