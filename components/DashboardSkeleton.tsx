export function DashboardSkeleton() {
  return (
    <div className="space-y-3 px-5 py-3 pb-8">
      <div className="pro-card-elevated p-3">
        <div className="pro-skeleton mb-3 h-8 w-40 rounded-lg" />
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pro-skeleton h-10 rounded-lg" />
          ))}
        </div>
      </div>

      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="pro-card p-3">
            <div className="pro-skeleton h-3 w-20 rounded" />
            <div className="pro-skeleton mt-3 h-7 w-24 rounded" />
          </div>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="pro-card-elevated p-3 lg:col-span-1">
          <div className="pro-skeleton h-4 w-32 rounded" />
          <div className="pro-skeleton mt-4 h-[200px] w-full rounded-xl" />
        </div>
        <div className="pro-card-elevated p-3 lg:col-span-2">
          <div className="pro-skeleton h-4 w-32 rounded" />
          <div className="pro-skeleton mt-4 h-[260px] w-full rounded-xl" />
        </div>
      </section>

      <div className="pro-card-elevated p-3">
        <div className="pro-skeleton h-4 w-40 rounded" />
        <div className="pro-skeleton mt-4 h-[200px] w-full rounded-xl" />
      </div>
    </div>
  );
}
