"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Application } from "@prisma/client";
import { StatusBadge } from "@/components/status-badge";
import { useLocale } from "@/components/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateFnsLocale } from "@/lib/analytics";

export function RecentActivity({ applications }: { applications: Application[] }) {
  const { locale, t } = useLocale();
  const dfLocale = dateFnsLocale(locale);

  return (
    <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">{t("recent.title")}</CardTitle>
        <Link
          href="/applications"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {t("recent.viewAll")}
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {applications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("recent.empty")}
          </p>
        ) : (
          applications.map((app) => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {app.company}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {app.jobTitle}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(app.updatedAt, {
                    addSuffix: true,
                    locale: dfLocale,
                  })}
                </p>
              </div>
              <StatusBadge status={app.status} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
