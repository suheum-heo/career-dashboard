"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function StatusPieChart({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  return (
    <div className="flex h-[260px] w-full flex-col items-center gap-4 sm:flex-row">
      <div className="h-[200px] w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid max-h-[220px] w-full grid-cols-2 gap-x-4 gap-y-2 overflow-auto sm:w-1/2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="truncate text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-medium tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
