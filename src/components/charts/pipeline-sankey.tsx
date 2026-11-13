"use client";

import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from "recharts";

type SankeyNode = {
  name: string;
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type SankeyLink = {
  source: number;
  target: number;
  value: number;
};

function OutcomeNode({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: SankeyNode;
}) {
  const fill = payload?.fill ?? "#94a3b8";
  return (
    <Layer>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.9}
        radius={2}
      />
      {payload?.name ? (
        <text
          x={x + width + 8}
          y={y + height / 2}
          dominantBaseline="middle"
          className="fill-foreground text-[11px]"
        >
          {payload.name}
        </text>
      ) : null}
    </Layer>
  );
}

export function PipelineSankey({
  data,
}: {
  data: {
    nodes: SankeyNode[];
    links: SankeyLink[];
  };
}) {
  if (!data.nodes.length || !data.links.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        —
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          nodePadding={28}
          nodeWidth={14}
          linkCurvature={0.5}
          margin={{ top: 12, right: 160, bottom: 12, left: 12 }}
          node={<OutcomeNode />}
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
