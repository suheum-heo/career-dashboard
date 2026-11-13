import { Application, ApplicationStatus } from "@prisma/client";
import {
  format,
  parseISO,
  startOfMonth,
  eachMonthOfInterval,
  subMonths,
  differenceInCalendarDays,
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
import {
  currentSeason,
  formatSeason,
  parseSeason,
  seasonOf,
  seasonRange,
} from "./season";

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
  season?: number | null; // recruiting season start year; exclusive with year/month
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
  if (period?.season) params.set("season", String(period.season));
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
  season?: string;
}): PeriodFilter {
  const season = parseSeason(params.season);
  const year = !season && params.year ? Number(params.year) : null;
  const month = year && params.month ? Number(params.month) : null;
  const startYear = params.startYear ? Number(params.startYear) : null;
  return {
    season,
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
    if (period.season && seasonOf(applicationDate(app)) !== period.season) {
      return false;
    }
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

export function availableSeasons(apps: Application[]): number[] {
  const seasons = new Set<number>([currentSeason()]);
  for (const app of apps) {
    seasons.add(seasonOf(applicationDate(app)));
  }
  return Array.from(seasons).sort((a, b) => b - a);
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
  else if (period.jobType === "CONTRACT") parts.push(t("period.contract"));
  if (period.startYear) parts.push(`${t("period.start")} ${period.startYear}`);
  if (period.season) {
    parts.push(t("common.season", { season: formatSeason(period.season) }));
  }
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
  const interviews = apps.filter(
    (a) => a.interviewReached || a.recruiterReached
  ).length;
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

export type RejectionStage = "resume" | "oa" | "recruiter" | "interview";

const REJECTION_STAGE_COLORS: Record<RejectionStage, string> = {
  resume: "#f43f5e",
  oa: "#8b5cf6",
  recruiter: "#06b6d4",
  interview: "#f59e0b",
};

const REJECTION_STAGES: RejectionStage[] = [
  "resume",
  "oa",
  "recruiter",
  "interview",
];

/** Furthest sticky stage reached before a rejection. */
export function rejectionStage(app: Application): RejectionStage | null {
  if (app.status !== ApplicationStatus.REJECTED) return null;
  if (app.interviewReached) return "interview";
  if (app.recruiterReached) return "recruiter";
  if (app.oaReached) return "oa";
  return "resume";
}

export function rejectionBreakdown(
  apps: Application[],
  t: Translator = createTranslator("en")
) {
  const counts: Record<RejectionStage, number> = {
    resume: 0,
    oa: 0,
    recruiter: 0,
    interview: 0,
  };
  for (const app of apps) {
    const stage = rejectionStage(app);
    if (stage) counts[stage] += 1;
  }
  const total = REJECTION_STAGES.reduce((sum, stage) => sum + counts[stage], 0);
  return REJECTION_STAGES.map((stage) => ({
    stage: t(`analytics.rejectionStage.${stage}`),
    count: counts[stage],
    fill: REJECTION_STAGE_COLORS[stage],
    pct: total ? Math.round((counts[stage] / total) * 100) : 0,
  }));
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

/** Cap open ranges at this month so future months don't plot as zero. */
function chartEndMonth(latest: Date, now = new Date()): Date {
  const current = startOfMonth(now);
  return latest.getTime() > current.getTime() ? current : startOfMonth(latest);
}

export function monthlyCountsForYear(apps: Application[], year: number) {
  const start = new Date(year, 0, 1);
  const end = chartEndMonth(new Date(year, 11, 1));
  if (end.getTime() < start.getTime()) return [];

  const range = eachMonthOfInterval({
    start: startOfMonth(start),
    end,
  });

  return range.map((month) => {
    const key = format(month, "yyyy-MM");
    const count = apps.filter(
      (a) => format(applicationDate(a), "yyyy-MM") === key
    ).length;
    return { month: format(month, "MMM"), full: key, count };
  });
}

export function monthlyCountsForSeason(apps: Application[], season: number) {
  const { start, end } = seasonRange(season);
  const last = chartEndMonth(subMonths(end, 1));
  if (last.getTime() < start.getTime()) return [];

  const range = eachMonthOfInterval({ start, end: last });

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
  if (period.season) return monthlyCountsForSeason(apps, period.season);
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

/** Waiting this many days with no response counts as "no answer". */
export const NO_ANSWER_AFTER_DAYS = 14;

export type OutcomeBucket =
  | "interviewOffer"
  | "interviewNoOffer"
  | "interviewWithdrawn"
  | "interviewActive"
  | "rejected"
  | "noAnswer"
  | "inProgress"
  | "recent";

const INTERVIEW_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.RECRUITER_SCREEN,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.FINAL_ROUND,
  ApplicationStatus.OFFER,
];

const IN_PROGRESS_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.OA,
  ApplicationStatus.RECRUITER_SCREEN,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.FINAL_ROUND,
];

function reachedInterview(app: Application): boolean {
  return (
    app.interviewReached ||
    app.recruiterReached ||
    INTERVIEW_STATUSES.includes(app.status)
  );
}

/** Mutually exclusive outcome for one submitted application. */
export function classifyOutcome(
  app: Application,
  now = new Date()
): OutcomeBucket | null {
  if (app.status === ApplicationStatus.WISHLIST) return null;

  if (reachedInterview(app)) {
    if (app.offerReceived || app.status === ApplicationStatus.OFFER) {
      return "interviewOffer";
    }
    if (app.status === ApplicationStatus.WITHDRAWN) return "interviewWithdrawn";
    if (app.status === ApplicationStatus.REJECTED) return "interviewNoOffer";
    if (app.status === ApplicationStatus.GHOSTED) return "interviewNoOffer";
    return "interviewActive";
  }

  if (
    app.status === ApplicationStatus.REJECTED ||
    app.status === ApplicationStatus.WITHDRAWN
  ) {
    return "rejected";
  }
  if (app.status === ApplicationStatus.GHOSTED) return "noAnswer";

  if (
    IN_PROGRESS_STATUSES.includes(app.status) ||
    app.responseReceived ||
    app.oaReached
  ) {
    return "inProgress";
  }

  const days = differenceInCalendarDays(now, applicationDate(app));
  if (days >= NO_ANSWER_AFTER_DAYS) return "noAnswer";
  return "recent";
}

function labeled(count: number, label: string) {
  return `${count} ${label}`;
}

/**
 * Flat outcome flow so every bucket sits on the right.
 * (A mid "Interviews" node was pushed left because it had children.)
 */
export function sankeyData(
  apps: Application[],
  t: Translator = createTranslator("en")
) {
  const submitted = apps.filter((a) => a.status !== ApplicationStatus.WISHLIST);
  const counts: Record<OutcomeBucket, number> = {
    interviewOffer: 0,
    interviewNoOffer: 0,
    interviewWithdrawn: 0,
    interviewActive: 0,
    rejected: 0,
    noAnswer: 0,
    inProgress: 0,
    recent: 0,
  };
  for (const app of submitted) {
    const bucket = classifyOutcome(app);
    if (bucket) counts[bucket] += 1;
  }

  const interviews =
    counts.interviewOffer +
    counts.interviewNoOffer +
    counts.interviewWithdrawn +
    counts.interviewActive;
  const total = submitted.length;
  const interviewPrefix = t("outcome.interviews");

  const terminals: {
    key: OutcomeBucket;
    count: number;
    name: string;
    fill: string;
  }[] = [
    {
      key: "interviewOffer",
      count: counts.interviewOffer,
      name: labeled(
        counts.interviewOffer,
        `${interviewPrefix} · ${t("outcome.offer")}`
      ),
      fill: "#6ee7b7",
    },
    {
      key: "interviewNoOffer",
      count: counts.interviewNoOffer,
      name: labeled(
        counts.interviewNoOffer,
        `${interviewPrefix} · ${t("outcome.noOffer")}`
      ),
      fill: "#94a3b8",
    },
    {
      key: "interviewWithdrawn",
      count: counts.interviewWithdrawn,
      name: labeled(
        counts.interviewWithdrawn,
        `${interviewPrefix} · ${t("outcome.withdrawnByMe")}`
      ),
      fill: "#d6d3d1",
    },
    {
      key: "interviewActive",
      count: counts.interviewActive,
      name: labeled(
        counts.interviewActive,
        `${interviewPrefix} · ${t("outcome.interviewActive")}`
      ),
      fill: "#fcd34d",
    },
    {
      key: "rejected",
      count: counts.rejected,
      name: labeled(counts.rejected, t("outcome.rejected")),
      fill: "#a3a35a",
    },
    {
      key: "noAnswer",
      count: counts.noAnswer,
      name: labeled(counts.noAnswer, t("outcome.noAnswer")),
      fill: "#67e8f9",
    },
    {
      key: "inProgress",
      count: counts.inProgress,
      name: labeled(counts.inProgress, t("outcome.inProgress")),
      fill: "#93c5fd",
    },
    {
      key: "recent",
      count: counts.recent,
      name: labeled(counts.recent, t("outcome.recent")),
      fill: "#fdba74",
    },
  ].filter((row) => row.count > 0);

  const nodes: { name: string; fill?: string }[] = [
    { name: labeled(total, t("outcome.applications")), fill: "#f9a8d4" },
    ...terminals.map((row) => ({ name: row.name, fill: row.fill })),
  ];

  const links = terminals.map((row, index) => ({
    source: 0,
    target: index + 1,
    value: row.count,
  }));

  return {
    nodes,
    links,
    summary: [
      {
        key: "interviews",
        label: t("outcome.interviews"),
        count: interviews,
        fill: "#94a3b8",
      },
      {
        key: "rejected",
        label: t("outcome.rejected"),
        count: counts.rejected,
        fill: "#a3a35a",
      },
      {
        key: "noAnswer",
        label: t("outcome.noAnswer"),
        count: counts.noAnswer,
        fill: "#67e8f9",
      },
      {
        key: "inProgress",
        label: t("outcome.inProgress"),
        count: counts.inProgress,
        fill: "#93c5fd",
      },
      {
        key: "recent",
        label: t("outcome.recent"),
        count: counts.recent,
        fill: "#fdba74",
      },
    ].filter((row) => row.count > 0),
    total,
  };
}

/**
 * Calendar date as a local Date with the UTC year/month/day.
 * Stored values are UTC midnight, which is still the previous evening
 * in timezones behind UTC, so local formatting shows the day before.
 */
export function asCalendarDate(date: Date | string): Date {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function formatCalendarDate(
  date: Date | string,
  pattern: string,
  options?: { locale?: DateLocale }
): string {
  return format(asCalendarDate(date), pattern, options);
}

export function parseOptionalDate(value?: string | null): Date | null {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (dateOnly) {
    const d = new Date(
      Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    );
    return isValid(d) ? d : null;
  }
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export function toDateInputValue(date?: Date | string | null): string {
  if (!date) return "";
  return formatCalendarDate(date, "yyyy-MM-dd");
}

/** Today's date as yyyy-MM-dd for date inputs / defaults. */
export function todayDateInputValue(now = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

/** Parse optional date string; fall back to today when empty. */
export function parseDateOrToday(value?: string | null): Date {
  return parseOptionalDate(value) ?? new Date();
}
