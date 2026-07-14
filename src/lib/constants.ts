import { ApplicationStatus, JobType } from "@prisma/client";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  OA: "OA",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW: "Interview",
  FINAL_ROUND: "Final Round",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  GHOSTED: "Ghosted",
};

export const STATUS_COLORS: Record<
  ApplicationStatus,
  { bg: string; text: string; dot: string }
> = {
  WISHLIST: {
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  APPLIED: {
    bg: "bg-blue-50 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  OA: {
    bg: "bg-violet-50 dark:bg-violet-950/50",
    text: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  RECRUITER_SCREEN: {
    bg: "bg-cyan-50 dark:bg-cyan-950/50",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
  INTERVIEW: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  FINAL_ROUND: {
    bg: "bg-orange-50 dark:bg-orange-950/50",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  OFFER: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    bg: "bg-rose-50 dark:bg-rose-950/50",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  WITHDRAWN: {
    bg: "bg-stone-100 dark:bg-stone-800/60",
    text: "text-stone-600 dark:text-stone-300",
    dot: "bg-stone-400",
  },
  GHOSTED: {
    bg: "bg-zinc-100 dark:bg-zinc-800/60",
    text: "text-zinc-600 dark:text-zinc-300",
    dot: "bg-zinc-400",
  },
};

export const STATUS_CHART_COLORS: Record<ApplicationStatus, string> = {
  WISHLIST: "#94a3b8",
  APPLIED: "#3b82f6",
  OA: "#8b5cf6",
  RECRUITER_SCREEN: "#06b6d4",
  INTERVIEW: "#f59e0b",
  FINAL_ROUND: "#f97316",
  OFFER: "#10b981",
  REJECTED: "#f43f5e",
  WITHDRAWN: "#a8a29e",
  GHOSTED: "#71717a",
};

export const PIPELINE_ORDER: ApplicationStatus[] = [
  ApplicationStatus.WISHLIST,
  ApplicationStatus.APPLIED,
  ApplicationStatus.OA,
  ApplicationStatus.RECRUITER_SCREEN,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.FINAL_ROUND,
  ApplicationStatus.OFFER,
];

export const ALL_STATUSES = Object.values(ApplicationStatus);

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  INTERNSHIP: "Internship",
  FULL_TIME: "Full-time",
};

export const ALL_JOB_TYPES = Object.values(JobType);

export const PAGE_SIZE = 10;

/** Status buckets used by dashboard/analytics rate cards. */
export const METRIC_STATUSES = {
  interviews: [
    ApplicationStatus.RECRUITER_SCREEN,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.FINAL_ROUND,
    ApplicationStatus.OFFER,
  ],
  offers: [ApplicationStatus.OFFER],
  responses: [
    ApplicationStatus.OA,
    ApplicationStatus.RECRUITER_SCREEN,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.FINAL_ROUND,
    ApplicationStatus.OFFER,
    ApplicationStatus.REJECTED,
  ],
  rejections: [ApplicationStatus.REJECTED],
  submitted: Object.values(ApplicationStatus).filter(
    (s) => s !== ApplicationStatus.WISHLIST
  ),
} as const;

export type ApplicationMetric = keyof typeof METRIC_STATUSES;

export const METRIC_LABELS: Record<ApplicationMetric, string> = {
  interviews: "Interviews",
  offers: "Offers",
  responses: "Responses",
  rejections: "Rejections",
  submitted: "Submitted applications",
};

export function isApplicationMetric(value: string): value is ApplicationMetric {
  return value in METRIC_STATUSES;
}
