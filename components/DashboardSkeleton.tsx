export function DashboardSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-4 py-2">
      <div className="pro-card shrink-0 p-2">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="pro-skeleton mb-1 h-2.5 w-10 rounded" />
              <div className="pro-skeleton h-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <section className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="pro-card p-2.5">
            <div className="pro-skeleton h-2.5 w-16 rounded" />
            <div className="pro-skeleton mt-2 h-5 w-20 rounded" />
          </div>
        ))}
      </section>

      <section className="grid min-h-0 flex-1 grid-cols-12 grid-rows-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`pro-card flex min-h-0 flex-col p-2 ${
              i % 2 === 0 ? "col-span-12 lg:col-span-3" : "col-span-12 lg:col-span-9"
            }`}
          >
            <div className="pro-skeleton h-3 w-28 shrink-0 rounded" />
            <div className="pro-skeleton mt-2 min-h-0 flex-1 rounded-lg" />
          </div>
        ))}
      </section>
    </div>
  );
}
