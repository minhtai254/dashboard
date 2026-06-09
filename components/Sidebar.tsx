import {
  Database,
  ExternalLink,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  sheetUrl: string;
  sheetTab: string;
  fetchedAt: string;
}

export function Sidebar({ sheetUrl, sheetTab, fetchedAt }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col bg-[#0f172a] text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white p-1.5 shadow-lg shadow-blue-500/10">
            <Image
              src="/tc-logo.png"
              alt="Thanh Cong"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Quality Control</h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Dyeing Dept.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>
        <a
          href="#"
          className="group flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium text-white ring-1 ring-white/10"
        >
          <LayoutDashboard className="h-4 w-4 text-blue-400" />
          Tổng quan
          <Sparkles className="ml-auto h-3.5 w-3.5 text-amber-400 opacity-80" />
        </a>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400">
          <Database className="h-4 w-4" />
          <span className="truncate">
            Sheet: <span className="text-slate-300">{sheetTab}</span>
          </span>
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
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
      </div>
    </aside>
  );
}
