import { Application, ApplicationStatus } from "@prisma/client";
import {
  format,
  parseISO,
  startOfMonth,
  eachMonthOfInterval,
  subMonths,
  isValid,
  type Locale as DateLocale,
} from "date-fns";
import { enUS, ko as koDate } from "date-fns/locale";
import { createTranslator, type Translator } from "@/i18n";
import type { Locale } from "@/i18n/config";
import {
  STATUS_CHART_COLORS,
  type ApplicationMetric,
} from "./constants";

export type DashboardStats = {
  total: number;
  interviews: number;
  offers: number;
  rejections: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
};

export type PeriodFilter = {
  year?: number | null;
  month?: number | null; // 1-12 applied month
  jobType?: string | null;
  startYear?: number | null;
};

/** Build /applications URL for a dashboard metric, preserving period filters. */
export function applicationsHrefForMetric(
  metric: ApplicationMetric,
  period?: PeriodFilter
): string {
  const params = new URLSearchParams();
  params.set("metric", metric);
  if (period?.jobType) params.set("jobType", period.jobType);
  if (period?.startYear) params.set("startYear", String(period.startYear));
  if (period?.year) params.set("year", String(period.year));
  if (period?.year && period?.month) params.set("month", String(period.month));
  return `/applications?${params.toString()}`;
}

/** Prefer date applied; fall back to createdAt for wishlist / undated rows. */
export function applicationDate(app: Application): Date {
  return app.dateApplied ?? app.createdAt;
}

export function parsePeriodFromSearchParams(params: {
  year?: string;
  month?: string;
  jobType?: string;
  startYear?: string;
}): PeriodFilter {
  const year = params.year ? Number(params.year) : null;
  const month = params.month ? Number(params.month) : null;
  const startYear = params.startYear ? Number(params.startYear) : null;
  return {
    year: year && Number.isFinite(year) ? year : null,
    month:
      month && Number.isFinite(month) && month >= 1 && month <= 12 ? month : null,
    jobType: params.jobType && params.jobType !== "ALL" ? params.jobType : null,
    startYear: startYear && Number.isFinite(startYear) ? startYear : null,
  };
}

export function filterByPeriod(
  apps: Application[],
  period: PeriodFilter
): Application[] {
  return apps.filter((app) => {
    if (period.jobType && app.jobType !== period.jobType) return false;
    if (period.startYear && app.startYear !== period.startYear) return false;
    if (period.year) {
      const d = applicationDate(app);
      if (d.getFullYear() !== period.year) return false;
      if (period.month && d.getMonth() + 1 !== period.month) return false;
    }
    return true;
  });
}

export function availableStartYears(apps: Application[]): number[] {
  const years = new Set<number>();
  for (const app of apps) {
    if (app.startYear) years.add(app.startYear);
  }
  const current = new Date().getFullYear();
  years.add(current);
  years.add(current + 1);
  return Array.from(years).sort((a, b) => b - a);
}

export function availableYears(apps: Application[]): number[] {
  const years = new Set<number>([new Date().getFullYear()]);
  for (const app of apps) {
    years.add(applicationDate(app).getFullYear());
  }
  return Array.from(years).sort((a, b) => b - a);
}

export function dateFnsLocale(locale: Locale): DateLocale {
  return locale === "ko" ? koDate : enUS;
}

export function formatPeriodLabel(
  period: PeriodFilter,
  t: Translator = createTranslator("en"),
  locale: Locale = "en"
): string {
  const parts: string[] = [];
  if (period.jobType === "INTERNSHIP") parts.push(t("period.internships"));
  else if (period.jobType === "FULL_TIME") parts.push(t("period.fullTime"));
  if (period.startYear) parts.push(`${t("period.start")} ${period.startYear}`);
  if (!period.year) {
    if (!parts.length) return t("period.allTime");
    return parts.join(" · ");
  }
  if (period.month) {
    const d = new Date(period.year, period.month - 1, 1);
    parts.push(
      `${t("period.applied")} ${format(d, locale === "ko" ? "yyyy년 MMM" : "MMM yyyy", { locale: dateFnsLocale(locale) })}`
    );
  } else {
    parts.push(`${t("period.applied")} ${period.year}`);
  }
  return parts.join(" · ");
}

export function computeStats(apps: Application[]): DashboardStats {
  const submitted = apps.filter((a) => a.status !== ApplicationStatus.WISHLIST);
  const total = submitted.length;
  const interviews = apps.filter((a) => a.interviewReached).length;
  const offers = apps.filter((a) => a.offerReceived).length;
  const rejections = apps.filter(
    (a) => a.status === ApplicationStatus.REJECTED
  ).length;
  const responses = apps.filter((a) => a.responseReceived).length;

  return {
    total,
    interviews,
    offers,
    rejections,
    responseRate: total ? Math.round((responses / total) * 100) : 0,
    interviewRate: total ? Math.round((interviews / total) * 100) : 0,
    offerRate: total ? Math.round((offers / total) * 100) : 0,
  };
}

export function monthlyApplicationCounts(apps: Application[], months = 6) {
  const end = startOfMonth(new Date());
  const start = startOfMonth(subMonths(end, months - 1));
  const range = eachMonthOfInterval({ start, end });

  return range.map((month) => {
    const key = format(month, "yyyy-MM");
    const count = apps.filter((a) => {
      return format(applicationDate(a), "yyyy-MM") === key;
    }).length;
    return { month: format(month, "MMM"), full: key, count };
  });
}

export function monthlyCountsForYear(apps: Application[], year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 1);
  const range = eachMonthOfInterval({
    start: startOfMonth(start),
    end: startOfMonth(end),
  });

  return range.map((month) => {
    const key = format(month, "yyyy-MM");
    const count = apps.filter(
      (a) => format(applicationDate(a), "yyyy-MM") === key
    ).length;
    return { month: format(month, "MMM"), full: key, count };
  });
}

export function yearlyApplicationCounts(apps: Application[]) {
  const years = availableYears(apps).slice().reverse();
  return years.map((year) => ({
    month: String(year),
    full: String(year),
    count: apps.filter((a) => applicationDate(a).getFullYear() === year).length,
  }));
}

export function chartDataForPeriod(
  apps: Application[],
  period: PeriodFilter,
  fallbackMonths = 6
) {
  if (!period.year) {
    const years = availableYears(apps);
    if (years.length > 1) return yearlyApplicationCounts(apps);
    if (years.length === 1) return monthlyCountsForYear(apps, years[0]!);
    return monthlyApplicationCounts(apps, fallbackMonths);
  }
  return monthlyCountsForYear(apps, period.year);
}

export function statusDistribution(
  apps: Application[],
  t: Translator = createTranslator("en")
) {
  const counts = new Map<ApplicationStatus, number>();
  for (const app of apps) {
    counts.set(app.status, (counts.get(app.status) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([status, value]) => ({
      status,
      name: t(`status.${status}`),
      value,
      fill: STATUS_CHART_COLORS[status],
    }))
    .sort((a, b) => b.value - a.value);
}

export function locationCounts(
  apps: Application[],
  limit = 8,
  t: Translator = createTranslator("en")
) {
  const counts = new Map<string, number>();
  for (const app of apps) {
    const loc = app.location?.trim() || t("common.unknown");
    counts.set(loc, (counts.get(loc) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function pipelineFunnel(
  apps: Application[],
  t: Translator = createTranslator("en")
) {
  const submitted = apps.filter((a) => a.status !== ApplicationStatus.WISHLIST);

  const stages = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.OA,
    ApplicationStatus.RECRUITER_SCREEN,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.FINAL_ROUND,
    ApplicationStatus.OFFER,
  ];

  const stageRank: Record<string, number> = {
    APPLIED: 1,
    OA: 2,
    RECRUITER_SCREEN: 3,
    INTERVIEW: 4,
    FINAL_ROUND: 5,
    OFFER: 6,
    REJECTED: 1,
    GHOSTED: 1,
    WITHDRAWN: 1,
    WISHLIST: 0,
  };

  return stages.map((status) => {
    const rank = stageRank[status];
    const count = submitted.filter((a) => (stageRank[a.status] ?? 0) >= rank)
      .length;
    return {
      stage: t(`status.${status}`),
      status,
      count,
      fill: STATUS_CHART_COLORS[status],
    };
  });
}

export function sankeyData(
  apps: Application[],
  t: Translator = createTranslator("en")
) {
  const submitted = apps.filter((a) => a.status !== ApplicationStatus.WISHLIST);
  const nodes = [
    { name: t("sankey.applied") },
    { name: t("sankey.oa") },
    { name: t("sankey.recruiter") },
    { name: t("sankey.interview") },
    { name: t("sankey.final") },
    { name: t("sankey.offer") },
    { name: t("sankey.rejected") },
    { name: t("sankey.ghosted") },
  ];

  const countStatus = (s: ApplicationStatus) =>
    submitted.filter((a) => a.status === s).length;

  const applied = submitted.length;
  const oa = countStatus(ApplicationStatus.OA);
  const recruiter = countStatus(ApplicationStatus.RECRUITER_SCREEN);
  const interview = countStatus(ApplicationStatus.INTERVIEW);
  const finalRound = countStatus(ApplicationStatus.FINAL_ROUND);
  const offer = countStatus(ApplicationStatus.OFFER);
  const rejected = countStatus(ApplicationStatus.REJECTED);
  const ghosted = countStatus(ApplicationStatus.GHOSTED);
  const withdrawn = countStatus(ApplicationStatus.WITHDRAWN);

  const atOrPast = (statuses: ApplicationStatus[]) =>
    submitted.filter((a) => statuses.includes(a.status)).length;

  const pastApplied =
    applied -
    countStatus(ApplicationStatus.APPLIED) -
    withdrawn;

  const links = [
    {
      source: 0,
      target: 1,
      value: Math.max(
        oa +
          atOrPast([
            ApplicationStatus.RECRUITER_SCREEN,
            ApplicationStatus.INTERVIEW,
            ApplicationStatus.FINAL_ROUND,
            ApplicationStatus.OFFER,
          ]),
        1
      ),
    },
    {
      source: 0,
      target: 6,
      value: Math.max(rejected, 1),
    },
    {
      source: 0,
      target: 7,
      value: Math.max(ghosted + withdrawn, 1),
    },
    {
      source: 1,
      target: 2,
      value: Math.max(
        recruiter +
          atOrPast([
            ApplicationStatus.INTERVIEW,
            ApplicationStatus.FINAL_ROUND,
            ApplicationStatus.OFFER,
          ]),
        1
      ),
    },
    {
      source: 2,
      target: 3,
      value: Math.max(
        interview +
          atOrPast([
            ApplicationStatus.FINAL_ROUND,
            ApplicationStatus.OFFER,
          ]),
        1
      ),
    },
    {
      source: 3,
      target: 4,
      value: Math.max(finalRound + offer, 1),
    },
    {
      source: 4,
      target: 5,
      value: Math.max(offer, 1),
    },
  ].filter((l) => l.value > 0);

  void pastApplied;
  return { nodes, links };
}

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export function toDateInputValue(date?: Date | null): string {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}
