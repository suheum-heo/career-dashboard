"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Application } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";

type Props = {
  items: Application[];
  page: number;
  totalPages: number;
  total: number;
};

function SortHeader({
  label,
  column,
  current,
  dir,
}: {
  label: string;
  column: string;
  current: string;
  dir: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    const nextDir = current === column && dir === "asc" ? "desc" : "asc";
    params.set("sortBy", column);
    params.set("sortDir", nextDir);
    router.push(`${pathname}?${params.toString()}`);
  }

  const Icon =
    current !== column ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
    >
      {label}
      <Icon className="size-3.5 opacity-50" />
    </button>
  );
}

export function ApplicationsTable({ items, page, totalPages, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sortBy") ?? "dateApplied";
  const sortDir = searchParams.get("sortDir") ?? "desc";

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <SortHeader label="Company" column="company" current={sortBy} dir={sortDir} />
              </TableHead>
              <TableHead>
                <SortHeader label="Job Title" column="jobTitle" current={sortBy} dir={sortDir} />
              </TableHead>
              <TableHead>
                <SortHeader label="Status" column="status" current={sortBy} dir={sortDir} />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Date Applied"
                  column="dateApplied"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>
                <SortHeader label="Location" column="location" current={sortBy} dir={sortDir} />
              </TableHead>
              <TableHead>Referral</TableHead>
              <TableHead>
                <SortHeader
                  label="Interview"
                  column="interviewDate"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((app) => (
                <TableRow key={app.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/applications/${app.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {app.company}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">{app.jobTitle}</TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {app.dateApplied ? format(app.dateApplied, "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-muted-foreground">
                    {app.location || "—"}
                  </TableCell>
                  <TableCell>{app.referral ? "Yes" : "No"}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {app.interviewDate
                      ? format(app.interviewDate, "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-muted-foreground">
                    {app.notes || "—"}
                  </TableCell>
                  <TableCell>
                    {app.jobLink ? (
                      <a
                        href={app.jobLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total} application{total === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
