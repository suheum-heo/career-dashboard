"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { ApplicationStatus, JobType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/components/locale-provider";
import {
  ALL_JOB_TYPES,
  ALL_STATUSES,
  isApplicationMetric,
} from "@/lib/constants";
import { signalNavigation } from "@/lib/navigation";

export function ApplicationFilters({
  locations,
  startYears,
}: {
  locations: string[];
  startYears: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const { t } = useLocale();

  const metricParam = searchParams.get("metric");
  const activeMetric =
    metricParam && isApplicationMetric(metricParam) ? metricParam : null;
  const appliedYear = searchParams.get("year");
  const appliedMonth = searchParams.get("month");

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "ALL") params.delete(key);
      else params.set(key, value);
    });
    params.delete("page");
    startTransition(() => {
      signalNavigation();
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (search === current) return;
      updateParams({ search: search || null });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function clearMetric() {
    updateParams({ metric: null, year: null, month: null });
  }

  const periodBits: string[] = [];
  if (appliedYear) {
    periodBits.push(
      appliedMonth
        ? `${t("common.applied")} ${appliedYear}-${appliedMonth.padStart(2, "0")}`
        : `${t("common.applied")} ${appliedYear}`
    );
  }

  return (
    <div
      className={`flex flex-col gap-3 ${isPending ? "pointer-events-none cursor-wait opacity-70" : ""}`}
    >
      {activeMetric ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{t("common.showing")}</span>
          <span className="font-medium">{t(`metric.${activeMetric}`)}</span>
          {periodBits.length ? (
            <span className="text-muted-foreground">· {periodBits.join(" · ")}</span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto h-7 rounded-lg px-2"
            onClick={clearMetric}
          >
            <X className="size-3.5" />
            {t("common.clear")}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search")}
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <Select
          value={searchParams.get("jobType") ?? "ALL"}
          onValueChange={(value) => updateParams({ jobType: value ?? "ALL" })}
        >
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-[150px]">
            <SelectValue>
              {(value: string | null) =>
                !value || value === "ALL"
                  ? t("common.allTypes")
                  : t(`jobType.${value as JobType}`)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.allTypes")}</SelectItem>
            {ALL_JOB_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`jobType.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("startYear") ?? "ALL"}
          onValueChange={(value) => updateParams({ startYear: value ?? "ALL" })}
        >
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-[160px]">
            <SelectValue>
              {(value: string | null) =>
                !value || value === "ALL"
                  ? t("common.allStartYears")
                  : `${t("common.start")} ${value}`
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.allStartYears")}</SelectItem>
            {startYears.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {t("common.start")} {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={activeMetric ? "METRIC" : (searchParams.get("status") ?? "ALL")}
          onValueChange={(value) => {
            if (value === "METRIC") return;
            updateParams({
              status: value ?? "ALL",
              metric: null,
              year: null,
              month: null,
            });
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-[180px]">
            <SelectValue>
              {(value: string | null) => {
                if (activeMetric) return t(`metric.${activeMetric}`);
                if (!value || value === "ALL") return t("common.allStatuses");
                return t(`status.${value as ApplicationStatus}`);
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {activeMetric ? (
              <SelectItem value="METRIC">{t(`metric.${activeMetric}`)}</SelectItem>
            ) : null}
            <SelectItem value="ALL">{t("common.allStatuses")}</SelectItem>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("location") ?? "ALL"}
          onValueChange={(value) => updateParams({ location: value ?? "ALL" })}
        >
          <SelectTrigger className="h-10 w-full rounded-xl sm:w-[200px]">
            <SelectValue>
              {(value: string | null) =>
                !value || value === "ALL" ? t("common.allLocations") : value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("common.allLocations")}</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
