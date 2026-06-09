"use client";

import {
  AlertTriangle,
  Factory,
  Layers,
  Package,
  PieChart,
  RefreshCw,
  Scale,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BuyerChart } from "@/components/BuyerChart";
import { ChartCard } from "@/components/ChartCard";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { DataTable } from "@/components/DataTable";
import { DefectCategoryChart } from "@/components/DefectCategoryChart";
import { DefectTypeChart } from "@/components/DefectTypeChart";
import { FilterBar } from "@/components/FilterBar";
import { KpiCard } from "@/components/KpiCard";
import { QtyGradeChart } from "@/components/QtyGradeChart";
import { Sidebar } from "@/components/Sidebar";
import {
  buildBuyerStats,
  buildDefectCategoryStats,
  buildDefectTypeStats,
  buildQtyGradeStats,
  buildSummary,
} from "@/lib/aggregate";
import { GOOGLE_SHEET_TAB, GOOGLE_SHEET_URL, REFRESH_INTERVAL_MINUTES, REFRESH_INTERVAL_MS } from "@/lib/config";
import { EMPTY_FILTERS, filterRecords, hasActiveFilters } from "@/lib/filters";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/format";
import type { DashboardFilters } from "@/lib/filters";
import type { InspectionData } from "@/lib/types";

export function Dashboard() {
  const [data, setData] = useState<InspectionData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/inspection?t=${Date.now()}`, {
        cache: "no-store",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Không thể tải dữ liệu");
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const intervalId = window.setInterval(() => loadData(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    return filterRecords(data.records, filters);
  }, [data, filters]);

  const view = useMemo(() => {
    if (!data) return null;
    return {
      summary: buildSummary(filteredRecords),
      byBuyer: buildBuyerStats(filteredRecords),
      topDefectTypes: buildDefectTypeStats(filteredRecords),
      byDefectCategory: buildDefectCategoryStats(filteredRecords),
      byQtyGrade: buildQtyGradeStats(filteredRecords),
    };
  }, [data, filteredRecords]);

  const isFiltered = hasActiveFilters(filters);
  const hasData = Boolean(data && view);

  return (
    <div className="pro-page-bg min-h-screen">
      <Sidebar
        sheetUrl={data?.source.url ?? GOOGLE_SHEET_URL}
        sheetTab={data?.source.sheetTab ?? GOOGLE_SHEET_TAB}
        fetchedAt={
          data ? formatDateTime(data.fetchedAt) : refreshing ? "Đang đồng bộ..." : "—"
        }
      />

      <main className="ml-[248px] min-h-screen">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 px-5 py-2.5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Inspection Overview
                </h2>
                {isFiltered && hasData ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                    Filtered
                  </span>
                ) : null}
                {refreshing ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Đang đồng bộ
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`pro-live-dot ${refreshing ? "opacity-50" : ""}`} />
                  Live · tab{" "}
                  <span className="font-semibold text-blue-600">
                    {data?.source.sheetTab ?? GOOGLE_SHEET_TAB}
                  </span>
                </span>
                <span className="text-slate-300">|</span>
                <span>Auto sync {REFRESH_INTERVAL_MINUTES} phút</span>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              Làm mới
            </button>
          </div>
        </header>

        {error && !hasData ? (
          <div className="flex items-center justify-center p-8">
            <div className="pro-card-elevated max-w-md p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Không thể kết nối Google Sheet
              </h2>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <button
                onClick={loadData}
                disabled={refreshing}
                className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40 disabled:opacity-60"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : !hasData ? (
          <DashboardSkeleton />
        ) : (
          <div
            className={`space-y-3 px-5 py-3 pb-8 transition-opacity duration-300 ${
              refreshing ? "opacity-70" : "opacity-100"
            }`}
          >
            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Đồng bộ thất bại — đang hiển thị dữ liệu cũ. {error}
              </div>
            ) : null}

            <FilterBar
              records={data!.records}
              filters={filters}
              onChange={setFilters}
              resultCount={filteredRecords.length}
              totalCount={data!.records.length}
            />

            <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <KpiCard
                title="Tổng dòng"
                value={formatNumber(view!.summary.totalRecords, 0)}
                subtitle="Inspection records"
                icon={Package}
                accent="blue"
              />
              <KpiCard
                title="Tổng lỗi"
                value={formatNumber(view!.summary.totalDefects, 0)}
                subtitle="TotalDefect"
                icon={AlertTriangle}
                accent="red"
              />
              <KpiCard
                title="Tỷ lệ lỗi"
                value={formatPercent(view!.summary.defectRate)}
                subtitle="Defect / Qty Kgs"
                icon={Scale}
                accent="yellow"
              />
              <KpiCard
                title="Tổng Qty Kgs"
                value={formatNumber(view!.summary.totalQtyKgs)}
                icon={Layers}
                accent="green"
              />
              <KpiCard
                title="Số Buyer"
                value={formatNumber(view!.summary.uniqueBuyers, 0)}
                icon={Factory}
                accent="purple"
              />
              <KpiCard
                title="Số Lot"
                value={formatNumber(view!.summary.uniqueLots, 0)}
                icon={TrendingUp}
                accent="blue"
              />
            </section>

            <section className="grid gap-3 overflow-visible lg:grid-cols-3">
              <ChartCard
                title="Phân loại lỗi"
                subtitle="Sợi (S) · Dệt (D) · Nhuộm (N)"
                icon={PieChart}
                accent="from-blue-500 to-cyan-500"
              >
                <DefectCategoryChart data={view!.byDefectCategory} />
              </ChartCard>

              <ChartCard
                title="Lỗi theo Buyer"
                subtitle="Cột + đường tỷ lệ lỗi (%)"
                className="lg:col-span-2"
                icon={Factory}
                accent="from-indigo-500 to-purple-600"
              >
                <BuyerChart data={view!.byBuyer} />
              </ChartCard>
            </section>

            <section className="grid gap-3 overflow-visible lg:grid-cols-3">
              <ChartCard
                title="Phân bổ Grade"
                subtitle="Qty Kgs theo A / B / C / X"
                icon={Layers}
                accent="from-emerald-500 to-teal-500"
              >
                <QtyGradeChart data={view!.byQtyGrade} />
              </ChartCard>

              <ChartCard
                title="Top 10 loại lỗi"
                subtitle="Xếp hạng theo số lượng"
                className="lg:col-span-2"
                icon={Trophy}
                accent="from-amber-500 to-orange-500"
              >
                <DefectTypeChart data={view!.topDefectTypes} />
              </ChartCard>
            </section>

            <DataTable records={filteredRecords} />
          </div>
        )}
      </main>
    </div>
  );
}
