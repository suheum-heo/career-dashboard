"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_JOB_TYPES, JOB_TYPE_LABELS } from "@/lib/constants";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function PeriodFilter({
  years,
  startYears,
}: {
  years: number[];
  startYears: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const year = searchParams.get("year") ?? "ALL";
  const month = searchParams.get("month") ?? "ALL";
  const jobType = searchParams.get("jobType") ?? "ALL";
  const startYear = searchParams.get("startYear") ?? "ALL";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "ALL") params.delete(key);
      else params.set(key, value);
    });
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${isPending ? "opacity-70" : ""}`}
    >
      <Select
        value={jobType}
        onValueChange={(value) =>
          updateParams({ jobType: value === "ALL" ? null : value })
        }
      >
        <SelectTrigger className="h-9 w-[140px] rounded-xl">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All types</SelectItem>
          {ALL_JOB_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {JOB_TYPE_LABELS[t]}
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
        <SelectTrigger className="h-9 w-[150px] rounded-xl">
          <SelectValue placeholder="Start year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All start years</SelectItem>
          {startYears.map((y) => (
            <SelectItem key={y} value={String(y)}>
              Start {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={year}
        onValueChange={(value) => {
          const nextYear = value ?? "ALL";
          if (nextYear === "ALL") {
            updateParams({ year: null, month: null });
          } else {
            updateParams({ year: nextYear });
          }
        }}
      >
        <SelectTrigger className="h-9 w-[140px] rounded-xl">
          <SelectValue placeholder="Applied year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All applied</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              Applied {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={month}
        disabled={year === "ALL"}
        onValueChange={(value) =>
          updateParams({ month: value === "ALL" ? null : value })
        }
      >
        <SelectTrigger className="h-9 w-[150px] rounded-xl">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All months</SelectItem>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
