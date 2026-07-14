"use client";

import Link from "next/link";
import { useState } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: string;
  href?: string;
}) {
  const [pressed, setPressed] = useState(false);

  const card = (
    <Card
      className={cn(
        "rounded-2xl border-border/50 bg-card/80 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)]",
        href &&
          "h-full hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        pressed && "scale-[0.98] border-primary/50 bg-accent/40 opacity-80"
      )}
    >
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : href ? (
            <p className="text-xs text-muted-foreground">View applications →</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary",
            accent
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      prefetch
      onClick={() => setPressed(true)}
      onBlur={() => setPressed(false)}
      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  );
}
