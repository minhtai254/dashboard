"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Table2 } from "lucide-react";
import type { InspectionRecord } from "@/lib/types";
import { formatNumber } from "@/lib/format";

interface DataTableProps {
  records: InspectionRecord[];
}

type SortField = "buyer" | "ocNo" | "jobOrderNo";
type FilterField = "all" | SortField;
type SortDir = "asc" | "desc";

const FILTER_OPTIONS: { value: FilterField; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "buyer", label: "Buyer" },
  { value: "ocNo", label: "OC No" },
  { value: "jobOrderNo", label: "OD No" },
];

const SORT_LABELS: Record<SortField, string> = {
  buyer: "Buyer",
  ocNo: "OC No",
  jobOrderNo: "OD No",
};

function getFieldValue(row: InspectionRecord, field: SortField): string {
  return row[field]?.trim() ?? "";
}

export function DataTable({ records }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState<FilterField>("all");
  const [sortField, setSortField] = useState<SortField>("buyer");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const buyers = useMemo(
    () =>
      Array.from(new Set(records.map((row) => row.buyer).filter(Boolean))).sort(),
    [records]
  );

  const ocNos = useMemo(
    () =>
      Array.from(new Set(records.map((row) => row.ocNo).filter(Boolean))).sort(),
    [records]
  );

  const jobOrderNos = useMemo(
    () =>
      Array.from(
        new Set(records.map((row) => row.jobOrderNo).filter(Boolean))
      ).sort(),
    [records]
  );

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    const pools: { value: string; type: FilterField }[] = [];

    const addPool = (values: string[], type: FilterField) => {
      for (const value of values) {
        if (value.toLowerCase().includes(query)) {
          pools.push({ value, type });
        }
      }
    };

    if (filterField === "all" || filterField === "buyer") addPool(buyers, "buyer");
    if (filterField === "all" || filterField === "ocNo") addPool(ocNos, "ocNo");
    if (filterField === "all" || filterField === "jobOrderNo") {
      addPool(jobOrderNos, "jobOrderNo");
    }

    const seen = new Set<string>();
    return pools
      .filter((item) => {
        const key = `${item.type}:${item.value}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);
  }, [search, filterField, buyers, ocNos, jobOrderNos]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const rows = records.filter((row) => {
      if (!query) return true;

      if (filterField === "buyer") {
        return row.buyer.toLowerCase().includes(query);
      }
      if (filterField === "ocNo") {
        return row.ocNo.toLowerCase().includes(query);
      }
      if (filterField === "jobOrderNo") {
        return row.jobOrderNo.toLowerCase().includes(query);
      }

      return [
        row.buyer,
        row.ocNo,
        row.jobOrderNo,
        row.lotNo,
        row.color,
        row.articleName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return [...rows].sort((a, b) => {
      const left = getFieldValue(a, sortField).toLowerCase();
      const right = getFieldValue(b, sortField).toLowerCase();
      const cmp = left.localeCompare(right, "vi");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [records, search, filterField, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const applySuggestion = (value: string, type: FilterField) => {
    setSearch(value);
    if (type !== "all") setFilterField(type);
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      const item = suggestions[highlightIndex];
      applySuggestion(item.value, item.type);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-blue-600" />
    );
  };

  return (
    <div className="pro-card-elevated overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 p-2 shadow-sm">
            <Table2 className="h-4 w-4 text-white" />
          </div>
          <div>
          <h3 className="text-sm font-bold text-slate-900">Chi tiết Inspection</h3>
          <p className="text-xs text-slate-500">
            Hiển thị {filtered.length.toLocaleString("vi-VN")} /{" "}
            {records.length.toLocaleString("vi-VN")} dòng
            {" · "}
            Sắp xếp: {SORT_LABELS[sortField]} ({sortDir === "asc" ? "A→Z" : "Z→A"})
          </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value as FilterField)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Lọc: {opt.label}
              </option>
            ))}
          </select>

          <div className="relative" ref={searchRef}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
                setHighlightIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder={
                filterField === "buyer"
                  ? "Tìm Buyer..."
                  : filterField === "ocNo"
                    ? "Tìm OC No..."
                    : filterField === "jobOrderNo"
                      ? "Tìm OD No..."
                      : "Tìm Buyer, OC, OD No..."
              }
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 sm:w-64"
            />

            {showSuggestions && suggestions.length > 0 ? (
              <ul className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl sm:w-64">
                {suggestions.map((item, index) => (
                  <li key={`${item.type}-${item.value}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applySuggestion(item.value, item.type)}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-blue-50 ${
                        index === highlightIndex ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                        {item.type === "buyer"
                          ? "Buyer"
                          : item.type === "ocNo"
                            ? "OC"
                            : "OD"}
                      </span>
                      <span className="truncate text-slate-800">{item.value}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-[11px] uppercase tracking-wider text-slate-500 backdrop-blur-sm">
            <tr>
              <th className="px-4 py-3 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("buyer")}
                  className="inline-flex items-center transition hover:text-blue-600"
                >
                  Buyer
                  <SortIcon field="buyer" />
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("ocNo")}
                  className="inline-flex items-center transition hover:text-blue-600"
                >
                  OC No
                  <SortIcon field="ocNo" />
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("jobOrderNo")}
                  className="inline-flex items-center transition hover:text-blue-600"
                >
                  OD No
                  <SortIcon field="jobOrderNo" />
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">Lot</th>
              <th className="px-4 py-3 font-semibold">Color</th>
              <th className="px-4 py-3 text-right font-semibold">Qty Kgs</th>
              <th className="px-4 py-3 text-right font-semibold">Net Qty</th>
              <th className="px-4 py-3 text-right font-semibold">Total Defect</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  Không có dữ liệu phù hợp bộ lọc
                </td>
              </tr>
            ) : (
              filtered.map((row, index) => (
                <tr
                  key={`${row.ocNo}-${row.jobOrderNo}-${row.lotNo}-${index}`}
                  className={`border-t border-slate-100 transition hover:bg-blue-50/40 ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-slate-800">{row.buyer}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">
                    {row.ocNo}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">
                    {row.jobOrderNo}
                  </td>
                  <td className="px-5 py-3 text-slate-700">{row.lotNo}</td>
                  <td className="px-5 py-3 text-slate-600">{row.color}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(row.qtyKgs)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(row.netQtyKgs)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={
                        row.totalDefect > 0
                          ? "inline-flex min-w-[2.5rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold text-red-700 bg-red-50 ring-1 ring-red-100"
                          : "inline-flex min-w-[2.5rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100"
                      }
                    >
                      {formatNumber(row.totalDefect, 0)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
