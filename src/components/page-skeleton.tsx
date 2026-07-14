export function PageSkeleton({
  cards = 4,
  showChart = true,
}: {
  cards?: number;
  showChart?: boolean;
}) {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-72 max-w-full rounded-lg bg-muted/70" />
      </div>
      <div
        className={`grid gap-4 sm:grid-cols-2 ${cards >= 5 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
      >
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted" />
        ))}
      </div>
      {showChart ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="h-72 rounded-2xl bg-muted lg:col-span-3" />
          <div className="h-72 rounded-2xl bg-muted lg:col-span-2" />
        </div>
      ) : (
        <div className="h-96 rounded-2xl bg-muted" />
      )}
    </div>
  );
}

export function ApplicationsSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-lg bg-muted" />
        <div className="h-4 w-64 max-w-full rounded-lg bg-muted/70" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="h-10 flex-1 rounded-xl bg-muted" />
        <div className="h-10 w-full rounded-xl bg-muted sm:w-[150px]" />
        <div className="h-10 w-full rounded-xl bg-muted sm:w-[160px]" />
        <div className="h-10 w-full rounded-xl bg-muted sm:w-[180px]" />
      </div>
      <div className="h-[420px] rounded-2xl bg-muted" />
    </div>
  );
}
