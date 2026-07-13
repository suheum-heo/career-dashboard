"use server";

import { revalidatePath } from "next/cache";
import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations";
import { parseOptionalDate } from "@/lib/analytics";
import { PAGE_SIZE } from "@/lib/constants";
import {
  extractFromImage,
  extractFromUrl,
  isGeminiConfigured,
} from "@/lib/extract-job";

export type ApplicationListParams = {
  search?: string;
  status?: string;
  location?: string;
  jobType?: string;
  startYear?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
};

function buildWhere(params: ApplicationListParams): Prisma.ApplicationWhereInput {
  const where: Prisma.ApplicationWhereInput = {};

  if (params.search) {
    where.OR = [
      { company: { contains: params.search, mode: "insensitive" } },
      { jobTitle: { contains: params.search, mode: "insensitive" } },
      { notes: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status as ApplicationStatus;
  }

  if (params.location && params.location !== "ALL") {
    where.location = { equals: params.location, mode: "insensitive" };
  }

  if (params.jobType && params.jobType !== "ALL") {
    where.jobType = params.jobType as import("@prisma/client").JobType;
  }

  if (params.startYear && params.startYear !== "ALL") {
    const year = Number(params.startYear);
    if (Number.isFinite(year)) where.startYear = year;
  }

  return where;
}

export async function getApplications(params: ApplicationListParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const sortBy = params.sortBy ?? "dateApplied";
  const sortDir = params.sortDir ?? "desc";
  const where = buildWhere(params);

  const allowedSort = new Set([
    "company",
    "jobTitle",
    "status",
    "jobType",
    "startYear",
    "dateApplied",
    "location",
    "interviewDate",
    "createdAt",
    "updatedAt",
  ]);
  const orderField = allowedSort.has(sortBy) ? sortBy : "dateApplied";

  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { [orderField]: sortDir },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getApplication(id: string) {
  return prisma.application.findUnique({ where: { id } });
}

export async function getAllApplications() {
  return prisma.application.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function getLocations() {
  const rows = await prisma.application.findMany({
    where: { location: { not: null } },
    select: { location: true },
    distinct: ["location"],
    orderBy: { location: "asc" },
  });
  return rows.map((r) => r.location!).filter(Boolean);
}

export async function getStartYears() {
  const rows = await prisma.application.findMany({
    where: { startYear: { not: null } },
    select: { startYear: true },
    distinct: ["startYear"],
    orderBy: { startYear: "desc" },
  });
  return rows.map((r) => r.startYear!).filter(Boolean);
}

export async function getRecentApplications(limit = 8) {
  return prisma.application.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getCalendarEvents() {
  const apps = await prisma.application.findMany({
    where: {
      OR: [
        { interviewDate: { not: null } },
        { deadline: { not: null } },
      ],
    },
    orderBy: { interviewDate: "asc" },
  });
  return apps;
}

export async function createApplication(raw: unknown) {
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const app = await prisma.application.create({
    data: {
      company: data.company,
      jobTitle: data.jobTitle,
      location: data.location || null,
      dateApplied: parseOptionalDate(data.dateApplied),
      status: data.status,
      jobType: data.jobType,
      startYear: data.startYear ?? null,
      salary: data.salary || null,
      referral: data.referral,
      jobLink: data.jobLink || null,
      resumeVersion: data.resumeVersion || null,
      coverLetter: data.coverLetter,
      notes: data.notes || null,
      interviewDate: parseOptionalDate(data.interviewDate),
      deadline: parseOptionalDate(data.deadline),
    },
  });

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath("/analytics");
  revalidatePath("/calendar");
  return { data: app };
}

export async function updateApplication(id: string, raw: unknown) {
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const app = await prisma.application.update({
    where: { id },
    data: {
      company: data.company,
      jobTitle: data.jobTitle,
      location: data.location || null,
      dateApplied: parseOptionalDate(data.dateApplied),
      status: data.status,
      jobType: data.jobType,
      startYear: data.startYear ?? null,
      salary: data.salary || null,
      referral: data.referral,
      jobLink: data.jobLink || null,
      resumeVersion: data.resumeVersion || null,
      coverLetter: data.coverLetter,
      notes: data.notes || null,
      interviewDate: parseOptionalDate(data.interviewDate),
      deadline: parseOptionalDate(data.deadline),
    },
  });

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath("/analytics");
  revalidatePath("/calendar");
  return { data: app };
}

export async function deleteApplication(id: string) {
  await prisma.application.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath("/analytics");
  revalidatePath("/calendar");
  return { success: true };
}

export async function deleteApplications(ids: string[]) {
  if (!ids.length) {
    return { error: "No applications selected" };
  }

  const result = await prisma.application.deleteMany({
    where: { id: { in: ids } },
  });

  revalidatePath("/");
  revalidatePath("/applications");
  revalidatePath("/analytics");
  revalidatePath("/calendar");
  return { success: true, count: result.count };
}

export async function getGeminiConfigured() {
  return isGeminiConfigured();
}

export async function importFromJobUrl(url: string) {
  try {
    if (!isGeminiConfigured()) {
      return {
        error:
          "GEMINI_API_KEY is not configured. Add it to .env and Vercel environment variables.",
      };
    }
    const data = await extractFromUrl(url.trim());
    return { data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to import from URL",
    };
  }
}

export async function importFromJobImage(input: {
  base64: string;
  mimeType: string;
}) {
  try {
    if (!isGeminiConfigured()) {
      return {
        error:
          "GEMINI_API_KEY is not configured. Add it to .env and Vercel environment variables.",
      };
    }
    const data = await extractFromImage(input.base64, input.mimeType);
    return { data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to import from image",
    };
  }
}
