import { ApplicationStatus } from "@prisma/client";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
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
      {STATUS_LABELS[status]}
    </span>
  );
}
