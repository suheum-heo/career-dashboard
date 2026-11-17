"use client";

import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { signalNavigation } from "@/lib/navigation";

type Row = { location: string; count: number; href: string };

export function LocationChart({ data }: { data: Row[] }) {
  const router = useRouter();
  const rows = [...data].reverse();
  const height = Math.max(280, rows.length * 36);

  function open(href: string) {
    signalNavigation();
    router.push(href);
  }

  function openLabel(label: string) {
    const row = rows.find((item) => item.location === label);
    if (row) open(row.href);
  }

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
            tick={(props: {
              x?: string | number;
              y?: string | number;
              payload?: { value?: string };
            }) => (
              <CountryTick
                x={Number(props.x)}
                y={Number(props.y)}
                payload={props.payload}
                onOpen={openLabel}
              />
            )}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          />
          <Bar
            dataKey="count"
            name="Applications"
            fill="#007AFF"
            radius={[0, 8, 8, 0]}
            cursor="pointer"
            onClick={(bar) => {
              const entry = bar as { href?: string; payload?: { href?: string } };
              const href = entry.href ?? entry.payload?.href;
              if (href) open(href);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CountryTick({
  x = 0,
  y = 0,
  payload,
  onOpen,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
  onOpen: (label: string) => void;
}) {
  const label = payload?.value ?? "";
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={12}
      className="cursor-pointer fill-foreground"
      onClick={() => onOpen(label)}
    >
      {label}
    </text>
  );
}
