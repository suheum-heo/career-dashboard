import { TopBar } from "@/components/layout/sidebar";
import { InterviewCalendar } from "@/components/calendar/interview-calendar";
import { getCalendarEvents } from "@/lib/actions";
import { getTranslator } from "@/i18n/server";

export default async function CalendarPage() {
  const [{ t }, events] = await Promise.all([
    getTranslator(),
    getCalendarEvents(),
  ]);

  return (
    <div>
      <TopBar
        title={t("calendar.title")}
        description={t("calendar.description")}
      />
      <InterviewCalendar applications={events} />
    </div>
  );
}
