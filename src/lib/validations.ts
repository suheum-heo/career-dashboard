import { z } from "zod";
import { ApplicationStatus, JobType } from "@prisma/client";

const statusValues = Object.values(ApplicationStatus) as [
  ApplicationStatus,
  ...ApplicationStatus[],
];

const jobTypeValues = Object.values(JobType) as [JobType, ...JobType[]];

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(120),
  jobTitle: z.string().min(1, "Job title is required").max(160),
  location: z.string().max(120).optional().nullable(),
  dateApplied: z.string().optional().nullable(),
  status: z.enum(statusValues),
  jobType: z.enum(jobTypeValues),
  startYear: z
    .union([z.number().int().min(2000).max(2100), z.null()])
    .optional()
    .nullable(),
  salary: z.string().max(80).optional().nullable(),
  referral: z.boolean(),
  jobLink: z
    .union([z.string().url("Enter a valid URL"), z.literal(""), z.null()])
    .optional(),
  resumeVersion: z.string().max(80).optional().nullable(),
  coverLetter: z.boolean(),
  notes: z.string().max(5000).optional().nullable(),
  interviewDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  interviewReached: z.boolean().optional().default(false),
  offerReceived: z.boolean().optional().default(false),
  responseReceived: z.boolean().optional().default(false),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

export const extractedJobSchema = z.object({
  company: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  salary: z.string().nullable().optional(),
  jobLink: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  jobType: z.enum(jobTypeValues).nullable().optional(),
  startYear: z.number().int().nullable().optional(),
});

export type ExtractedJob = z.infer<typeof extractedJobSchema>;
