import { PipelineSankey } from "@/components/charts/pipeline-sankey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SummaryRow = {
  key: string;
  label: string;
  count: number;
  fill: string;
};

export function OutcomeFlowCard({
  title,
  total,
  summary,
  sankey,
}: {
  title: string;
  total: number;
  summary: SummaryRow[];
  sankey: {
    nodes: { name: string; fill?: string }[];
    links: { source: number; target: number; value: number }[];
  };
}) {
  return (
    <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">—</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {summary.map((row) => (
                <div
                  key={row.key}
                  className="inline-flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-1.5 text-sm"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: row.fill }}
                  />
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="tabular-nums font-medium">{row.count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({total ? Math.round((row.count / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
            <PipelineSankey data={sankey} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
