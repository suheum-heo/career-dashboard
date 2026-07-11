"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function LocationChart({
  data,
}: {
  data: { location: string; count: number }[];
}) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
          <XAxis
            dataKey="location"
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-28}
            textAnchor="end"
            tick={{ fontSize: 11 }}
          />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Bar dataKey="count" name="Applications" fill="#007AFF" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
