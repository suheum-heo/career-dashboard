import Link from "next/link";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Row = {
  stage: string;
  count: number;
  fill: string;
  pct: number;
};

export function RejectionBreakdownCard({
  title,
  emptyLabel,
  viewAllLabel,
  viewAllHref,
  rows,
}: {
  title: string;
  emptyLabel: string;
  viewAllLabel: string;
  viewAllHref: string;
  rows: Row[];
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {total ? (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {viewAllLabel}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <>
            <FunnelChart data={rows} />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {rows.map((row) => (
                <div
                  key={row.stage}
                  className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{row.stage}</span>
                  <span className="tabular-nums font-medium">
                    {row.count}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({row.pct}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
