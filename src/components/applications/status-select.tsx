"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useLocale } from "@/components/locale-provider";
import { ALL_STATUSES } from "@/lib/constants";
import { updateApplicationStatus } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function StatusSelect({
  applicationId,
  status,
  className,
}: {
  applicationId: string;
  status: ApplicationStatus;
  className?: string;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  function onChange(value: string | null) {
    if (!value || value === current) return;
    const previous = current;
    setCurrent(value as ApplicationStatus);
    startTransition(async () => {
      const result = await updateApplicationStatus(applicationId, value);
      if ("error" in result && result.error) {
        setCurrent(previous);
        toast.error(result.error);
        return;
      }
      toast.success(t("applications.statusUpdated"));
      router.refresh();
    });
  }

  return (
    <div className={cn("shrink-0", className)}>
      <Select value={current} onValueChange={onChange} disabled={isPending}>
        <SelectTrigger
          size="sm"
          aria-label={t("applications.status")}
          className={cn(
            "h-auto rounded-full border-transparent bg-transparent p-0 pr-1 shadow-none hover:bg-muted/60 dark:bg-transparent",
            isPending && "opacity-60"
          )}
        >
          <StatusBadge status={current} />
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false} className="min-w-44">
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`status.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
