"use client";

import {
  AlertTriangle,
  Factory,
  Layers,
  PieChart,
  RefreshCw,
  Scale,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BuyerChart, BuyerChartLegend } from "@/components/BuyerChart";
import { ChartCard } from "@/components/ChartCard";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
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
import { EMPTY_DATE_FILTER, hasActiveDateFilter } from "@/lib/dateFilter";
import type { DateFilterState } from "@/lib/dateFilter";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/format";
import type { DashboardFilters } from "@/lib/filters";
import type { InspectionData } from "@/lib/types";

type DashboardTab = "quality" | "quantity";

const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "quality", label: "QUALITY" },
  { id: "quantity", label: "QUANTITY" },
];

export function Dashboard() {
  const [data, setData] = useState<InspectionData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);
  const [quantityFilters, setQuantityFilters] = useState<DashboardFilters>(EMPTY_FILTERS);
  const [dateFilter, setDateFilter] = useState<DateFilterState>(EMPTY_DATE_FILTER);
  const [activeTab, setActiveTab] = useState<DashboardTab>("quality");

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
    return filterRecords(data.records, filters, dateFilter);
  }, [data, filters, dateFilter]);

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

  const isFiltered =
    activeTab === "quality"
      ? hasActiveFilters(filters) || hasActiveDateFilter(dateFilter)
      : hasActiveFilters(quantityFilters) || hasActiveDateFilter(dateFilter);
  const hasData = Boolean(data && view);

  return (
    <div className="pro-page-bg flex h-full w-full overflow-hidden">
      <Sidebar
        sheetUrl={data?.source.url ?? GOOGLE_SHEET_URL}
        sheetTab={data?.source.sheetTab ?? GOOGLE_SHEET_TAB}
        fetchedAt={
          data ? formatDateTime(data.fetchedAt) : refreshing ? "Đang đồng bộ..." : "—"
        }
      />

      <main className="ml-[248px] flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 shrink-0 border-b border-slate-200 bg-white px-6 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                QC OPERATIONAL DASHBOARD
              </h2>
              <div
                className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
                role="tablist"
                aria-label="Dashboard view"
              >
                {DASHBOARD_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-md px-3 py-1 text-[11px] font-bold tracking-wide transition ${
                      activeTab === tab.id
                        ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <span className="hidden h-3.5 w-px bg-slate-200 sm:inline-block" />
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                <span className={`pro-live-dot scale-90 ${refreshing ? "opacity-50" : ""}`} />
                Live ·{" "}
                <span className="font-semibold text-blue-600">
                  {data?.source.sheetTab ?? GOOGLE_SHEET_TAB}
                </span>
                <span className="text-slate-300">·</span>
                <span>Sync {REFRESH_INTERVAL_MINUTES}m</span>
              </span>
              {isFiltered && hasData ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Filtered
                </span>
              ) : null}
              {refreshing ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                  Syncing
                </span>
              ) : null}
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

        {activeTab === "quantity" ? (
          error && !hasData ? (
            <div className="flex min-h-0 flex-1 items-center justify-center p-8">
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
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-4">
              {error ? (
                <div className="flex shrink-0 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Đồng bộ thất bại — đang hiển thị dữ liệu cũ. {error}
                </div>
              ) : null}

              <div className="shrink-0">
                <FilterBar
                  records={data!.records}
                  filters={quantityFilters}
                  onChange={setQuantityFilters}
                  dateFilter={dateFilter}
                  onDateChange={setDateFilter}
                />
              </div>

              <div className="min-h-0 flex-1" />
            </div>
          )
        ) : error && !hasData ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-8">
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
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-4">
            {error ? (
              <div className="flex shrink-0 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Đồng bộ thất bại — đang hiển thị dữ liệu cũ. {error}
              </div>
            ) : null}

            <div className="shrink-0">
              <FilterBar
                records={data!.records}
                filters={filters}
                onChange={setFilters}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
              />
            </div>

            <section className="grid shrink-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <KpiCard
                title="Total Defect"
                value={formatNumber(view!.summary.totalDefects, 0)}
                icon={AlertTriangle}
                accent="red"
              />
              <KpiCard
                title="Defect / Qty Kgs"
                value={formatPercent(view!.summary.defectRate)}
                icon={Scale}
                accent="yellow"
              />
              <KpiCard
                title="Qty Kgs"
                value={formatNumber(view!.summary.totalQtyKgs)}
                icon={Layers}
                accent="green"
              />
              <KpiCard
                title="Buyers"
                value={formatNumber(view!.summary.uniqueBuyers, 0)}
                icon={Factory}
                accent="purple"
              />
              <KpiCard
                title="Lots"
                value={formatNumber(view!.summary.uniqueLots, 0)}
                icon={TrendingUp}
                accent="blue"
              />
            </section>

            <section className="grid min-h-0 flex-1 grid-cols-12 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
              <ChartCard
                title="Phân loại lỗi"
                subtitle="Sợi · Đan · Nhuộm"
                icon={PieChart}
                accent="from-blue-500 to-cyan-500"
                className="col-span-12 h-full lg:col-span-3"
              >
                <DefectCategoryChart data={view!.byDefectCategory} />
              </ChartCard>

              <ChartCard
                title="Lỗi theo Buyer"
                subtitle="Cột + tỷ lệ lỗi"
                className="col-span-12 h-full lg:col-span-9"
                icon={Factory}
                accent="from-indigo-500 to-purple-600"
                headerExtra={<BuyerChartLegend />}
              >
                <BuyerChart data={view!.byBuyer} />
              </ChartCard>

              <ChartCard
                title="Phân bổ Grade"
                subtitle="Qty Kgs A/B/C/X"
                icon={Layers}
                accent="from-emerald-500 to-teal-500"
                className="col-span-12 h-full lg:col-span-3"
              >
                <QtyGradeChart data={view!.byQtyGrade} />
              </ChartCard>

              <ChartCard
                title="Loại lỗi"
                subtitle="Theo số lượng"
                className="col-span-12 h-full lg:col-span-9"
                icon={Trophy}
                accent="from-amber-500 to-orange-500"
              >
                <DefectTypeChart data={view!.topDefectTypes} />
              </ChartCard>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
