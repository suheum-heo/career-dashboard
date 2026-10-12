"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/components/locale-provider";
import { ALL_JOB_TYPES } from "@/lib/constants";
import { signalNavigation } from "@/lib/navigation";
import { formatSeason, parseSeason } from "@/lib/season";
import type { JobType } from "@prisma/client";

const MONTH_VALUES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const;

const SEASON_PREFIX = "season:";

export function PeriodFilter({
  years,
  startYears,
  seasons,
}: {
  years: number[];
  startYears: number[];
  seasons: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useLocale();

  const season = parseSeason(searchParams.get("season"));
  const year = season ? "ALL" : (searchParams.get("year") ?? "ALL");
  const month = searchParams.get("month") ?? "ALL";
  const appliedValue = season ? `${SEASON_PREFIX}${season}` : year;
  const jobType = searchParams.get("jobType") ?? "ALL";
  const startYear = searchParams.get("startYear") ?? "ALL";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "ALL") params.delete(key);
      else params.set(key, value);
    });
    startTransition(() => {
      signalNavigation();
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${isPending ? "pointer-events-none cursor-wait opacity-70" : ""}`}
    >
      <Select
        value={jobType}
        onValueChange={(value) =>
          updateParams({ jobType: value === "ALL" ? null : value })
        }
      >
        <SelectTrigger className="h-9 min-w-[140px] rounded-xl">
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
        value={startYear}
        onValueChange={(value) =>
          updateParams({ startYear: value === "ALL" ? null : value })
        }
      >
        <SelectTrigger className="h-9 min-w-[150px] rounded-xl">
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
        value={appliedValue}
        onValueChange={(value) => {
          const next = value ?? "ALL";
          if (next === "ALL") {
            updateParams({ season: null, year: null, month: null });
          } else if (next.startsWith(SEASON_PREFIX)) {
            updateParams({
              season: next.slice(SEASON_PREFIX.length),
              year: null,
              month: null,
            });
          } else {
            updateParams({ season: null, year: next });
          }
        }}
      >
        <SelectTrigger className="h-9 min-w-[150px] rounded-xl">
          <SelectValue>
            {(value: string | null) => {
              if (!value || value === "ALL") return t("common.allApplied");
              if (value.startsWith(SEASON_PREFIX)) {
                const s = parseSeason(value.slice(SEASON_PREFIX.length));
                if (s) return t("common.season", { season: formatSeason(s) });
              }
              return `${t("common.applied")} ${value}`;
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("common.allApplied")}</SelectItem>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>{t("common.recruitingSeasons")}</SelectLabel>
            {seasons.map((s) => (
              <SelectItem key={`season-${s}`} value={`${SEASON_PREFIX}${s}`}>
                {t("common.season", { season: formatSeason(s) })}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>{t("common.calendarYears")}</SelectLabel>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {t("common.applied")} {y}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={month}
        disabled={year === "ALL"}
        onValueChange={(value) =>
          updateParams({ month: value === "ALL" ? null : value })
        }
      >
        <SelectTrigger className="h-9 min-w-[150px] rounded-xl">
          <SelectValue>
            {(value: string | null) =>
              !value || value === "ALL"
                ? t("common.allMonths")
                : t(`months.${value as (typeof MONTH_VALUES)[number]}`)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("common.allMonths")}</SelectItem>
          {MONTH_VALUES.map((m) => (
            <SelectItem key={m} value={m}>
              {t(`months.${m}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
