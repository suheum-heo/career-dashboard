"use client";

import { ApplicationStatus } from "@prisma/client";
import { STATUS_COLORS } from "@/lib/constants";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { t } = useLocale();
  const colors = STATUS_COLORS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text
      )}
    >
      <span className={cn("size-1.5 rounded-full", colors.dot)} />
      {t(`status.${status}`)}
    </span>
  );
}
