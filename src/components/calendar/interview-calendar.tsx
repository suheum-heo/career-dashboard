"use client";

import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { Application } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useLocale } from "@/components/locale-provider";
import { dateFnsLocale } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import Link from "next/link";

type EventKind = "interview" | "deadline";

type DayEvent = {
  id: string;
  kind: EventKind;
  date: Date;
  company: string;
  jobTitle: string;
  application: Application;
};

const WEEKDAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export function InterviewCalendar({ applications }: { applications: Application[] }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(new Date());
  const { locale, t } = useLocale();
  const dfLocale = dateFnsLocale(locale);

  const events = useMemo(() => {
    const list: DayEvent[] = [];
    for (const app of applications) {
      if (app.interviewDate) {
        list.push({
          id: `${app.id}-interview`,
          kind: "interview",
          date: app.interviewDate,
          company: app.company,
          jobTitle: app.jobTitle,
          application: app,
        });
      }
      if (app.deadline) {
        list.push({
          id: `${app.id}-deadline`,
          kind: "deadline",
          date: app.deadline,
          company: app.company,
          jobTitle: app.jobTitle,
          application: app,
        });
      }
    }
    return list;
  }, [applications]);

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const startPad = (startOfMonth(month).getDay() + 6) % 7; // Monday-first
  const selectedEvents = events.filter((e) => isSameDay(e.date, selected));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">
            {format(month, "MMMM yyyy", { locale: dfLocale })}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setMonth(subMonths(month, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAY_KEYS.map((key) => (
              <div key={key} className="py-2">
                {t(`weekdays.${key}`)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dayEvents = events.filter((e) => isSameDay(e.date, day));
              const selectedDay = isSameDay(day, selected);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelected(day)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-start rounded-xl p-1 text-sm transition-colors",
                    !isSameMonth(day, month) && "opacity-40",
                    selectedDay
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                    isToday(day) && !selectedDay && "ring-1 ring-primary/40"
                  )}
                  aria-label={
                    isToday(day) ? t("calendar.today") : undefined
                  }
                >
                  <span className="mt-1 text-xs font-medium">
                    {format(day, "d", { locale: dfLocale })}
                  </span>
                  <div className="mt-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={cn(
                          "size-1.5 rounded-full",
                          selectedDay
                            ? "bg-primary-foreground"
                            : e.kind === "interview"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        )}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />{" "}
              {t("calendar.interviews")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />{" "}
              {t("calendar.deadlines")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {format(selected, "EEEE, MMM d", { locale: dfLocale })}
            {isToday(selected) ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                · {t("calendar.today")}
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedEvents.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("calendar.empty")}
            </p>
          ) : (
            selectedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/applications/${event.application.id}`}
                className="block rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      event.kind === "interview"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                    )}
                  >
                    {event.kind === "interview"
                      ? t("status.INTERVIEW")
                      : t("applications.deadline")}
                  </span>
                  <StatusBadge status={event.application.status} />
                </div>
                <p className="font-medium">{event.company}</p>
                <p className="text-sm text-muted-foreground">{event.jobTitle}</p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
