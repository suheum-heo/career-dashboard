"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Application } from "@prisma/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/status-badge";
import { deleteApplications } from "@/lib/actions";
import { JOB_TYPE_LABELS } from "@/lib/constants";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const pageIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    setSelected(new Set());
  }, [page, searchParams]);

  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected =
    pageIds.some((id) => selected.has(id)) && !allSelected;

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        pageIds.forEach((id) => next.add(id));
      } else {
        pageIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  }

  function handleBulkDelete() {
    const ids = Array.from(selected);
    if (!ids.length) return;

    const label =
      ids.length === 1
        ? "Delete 1 application?"
        : `Delete ${ids.length} applications?`;
    if (!confirm(label)) return;

    startTransition(async () => {
      const result = await deleteApplications(ids);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `Deleted ${result.count ?? ids.length} application${
          (result.count ?? ids.length) === 1 ? "" : "s"
        }`
      );
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-medium">
            {selected.size} selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={isPending}
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              disabled={isPending}
              onClick={handleBulkDelete}
            >
              <Trash2 className="size-4" />
              {isPending ? "Deleting…" : "Delete selected"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={(value) => toggleAll(value === true)}
                  aria-label="Select all on this page"
                  disabled={items.length === 0 || isPending}
                />
              </TableHead>
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
                <SortHeader label="Type" column="jobType" current={sortBy} dir={sortDir} />
              </TableHead>
              <TableHead>
                <SortHeader
                  label="Start"
                  column="startYear"
                  current={sortBy}
                  dir={sortDir}
                />
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
                <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((app) => {
                const isSelected = selected.has(app.id);
                return (
                  <TableRow
                    key={app.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={isSelected ? "bg-muted/40" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(value) =>
                          toggleOne(app.id, value === true)
                        }
                        aria-label={`Select ${app.company}`}
                        disabled={isPending}
                      />
                    </TableCell>
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
                    <TableCell className="text-muted-foreground">
                      {JOB_TYPE_LABELS[app.jobType]}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {app.startYear ?? "—"}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total} application{total === 1 ? "" : "s"}
          {selected.size > 0 ? ` · ${selected.size} selected` : ""}
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
