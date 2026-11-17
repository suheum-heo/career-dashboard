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
  const rows = [...data].reverse();
  const height = Math.max(280, rows.length * 36);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.4} />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="location"
            width={128}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Bar dataKey="count" name="Applications" fill="#007AFF" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
