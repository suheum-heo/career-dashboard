import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

const statusValues = Object.values(ApplicationStatus) as [
  ApplicationStatus,
  ...ApplicationStatus[],
];

export const applicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(120),
  jobTitle: z.string().min(1, "Job title is required").max(160),
  location: z.string().max(120).optional().nullable(),
  dateApplied: z.string().optional().nullable(),
  status: z.enum(statusValues),
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
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
