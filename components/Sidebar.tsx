"use client";

import {
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export const SIDEBAR_WIDTH_EXPANDED = 248;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

interface SidebarProps {
  sheetUrl: string;
  sheetTab: string;
  fetchedAt: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({
  sheetUrl,
  sheetTab,
  fetchedAt,
  collapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-[#0f172a] text-white transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[248px]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Mở sidebar" : "Thu gọn sidebar"}
        className="absolute -right-3 top-[4.5rem] z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      <div className={`border-b border-white/10 ${collapsed ? "px-3 py-5" : "px-5 py-6"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="shrink-0 rounded-xl bg-white p-1.5 shadow-lg shadow-blue-500/10">
            <Image
              src="/tc-logo.png"
              alt="Thanh Cong"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight">QC Dept.</h1>
              <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Dyeing Factory
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-5">
        {!collapsed ? (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navigation
          </p>
        ) : null}
        <a
          href="#"
          title="Tổng quan"
          className={`group flex items-center rounded-xl bg-white/10 text-sm font-medium text-white ring-1 ring-white/10 ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          }`}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0 text-blue-400" />
          {!collapsed ? (
            <>
              Tổng quan
              <Sparkles className="ml-auto h-3.5 w-3.5 text-amber-400 opacity-80" />
            </>
          ) : null}
        </a>
        <div
          title={`Sheet: ${sheetTab}`}
          className={`flex items-center rounded-xl text-sm text-slate-400 ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          }`}
        >
          <Database className="h-4 w-4 shrink-0" />
          {!collapsed ? (
            <span className="truncate">
              Sheet: <span className="text-slate-300">{sheetTab}</span>
            </span>
          ) : null}
        </div>
      </nav>

      <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-4"}`}>
        {!collapsed ? (
          <>
            <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="flex items-center gap-2">
                <div className="pro-live-dot" />
                <span className="text-xs font-medium text-emerald-400">Live sync</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Cập nhật lúc</p>
              <p className="mt-0.5 text-sm font-medium text-slate-200">{fetchedAt}</p>
            </div>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/10 transition hover:bg-white/15"
            >
              Mở Google Sheet
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10"
              title={`Live sync · ${fetchedAt}`}
            >
              <div className="pro-live-dot" />
            </div>
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở Google Sheet"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-200 ring-1 ring-white/10 transition hover:bg-white/15"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
