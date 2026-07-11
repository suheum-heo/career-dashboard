import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Application } from "@prisma/client";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentActivity({ applications }: { applications: Application[] }) {
  return (
    <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {applications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No applications yet. Add your first one to get started.
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
                  Updated {formatDistanceToNow(app.updatedAt, { addSuffix: true })}
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
