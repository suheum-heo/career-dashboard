"use client";

import { Sankey, Tooltip, ResponsiveContainer } from "recharts";

export function PipelineSankey({
  data,
}: {
  data: {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
  };
}) {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          nodePadding={24}
          nodeWidth={12}
          linkCurvature={0.5}
          margin={{ top: 12, right: 24, bottom: 12, left: 24 }}
        >
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}
