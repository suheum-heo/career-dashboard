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
import { useLocale } from "@/components/locale-provider";
import { dateFnsLocale } from "@/lib/analytics";
import { deleteApplications } from "@/lib/actions";
import { signalNavigation } from "@/lib/navigation";

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
    signalNavigation();
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
  const { locale, t } = useLocale();
  const dfLocale = dateFnsLocale(locale);
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
    signalNavigation();
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
        ? t("applications.bulkDeleteOne")
        : t("applications.bulkDeleteMany", { count: ids.length });
    if (!confirm(label)) return;

    startTransition(async () => {
      const result = await deleteApplications(ids);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      const count = result.count ?? ids.length;
      toast.success(
        count === 1
          ? t("applications.deletedCount", { count })
          : t("applications.deletedCountPlural", { count })
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
            {selected.size} {t("common.selected")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={isPending}
              onClick={() => setSelected(new Set())}
            >
              {t("common.clear")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl"
              disabled={isPending}
              onClick={handleBulkDelete}
            >
              <Trash2 className="size-4" />
              {isPending ? t("common.saving") : t("common.deleteSelected")}
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
                <SortHeader
                  label={t("applications.company")}
                  column="company"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label={t("applications.jobTitle")}
                  column="jobTitle"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label={t("applications.status")}
                  column="status"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label={t("applications.type")}
                  column="jobType"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label={t("common.start")}
                  column="startYear"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label={t("applications.dateApplied")}
                  column="dateApplied"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  label={t("applications.location")}
                  column="location"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>{t("applications.referral")}</TableHead>
              <TableHead>
                <SortHeader
                  label={t("status.INTERVIEW")}
                  column="interviewDate"
                  current={sortBy}
                  dir={sortDir}
                />
              </TableHead>
              <TableHead>{t("applications.notes")}</TableHead>
              <TableHead>{t("applications.jobLink")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                  {t("applications.empty")}
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
                      {t(`jobType.${app.jobType}`)}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {app.startYear ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {app.dateApplied
                        ? format(app.dateApplied, "MMM d, yyyy", {
                            locale: dfLocale,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-muted-foreground">
                      {app.location || "—"}
                    </TableCell>
                    <TableCell>{app.referral ? "Yes" : "No"}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {app.interviewDate
                        ? format(app.interviewDate, "MMM d, yyyy", {
                            locale: dfLocale,
                          })
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
          {total} {t("analytics.applications")}
          {selected.size > 0
            ? ` · ${selected.size} ${t("common.selected")}`
            : ""}
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
            {t("common.previous")}
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            {t("common.page")} {page} {t("common.of")} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            {t("common.next")}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
