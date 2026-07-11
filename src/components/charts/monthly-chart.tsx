"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MonthlyChart({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="appsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#007AFF" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#007AFF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 12, opacity: 0.55 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 12, opacity: 0.55 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Applications"
            stroke="#007AFF"
            strokeWidth={2.5}
            fill="url(#appsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
