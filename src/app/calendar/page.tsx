import { TopBar } from "@/components/layout/sidebar";
import { InterviewCalendar } from "@/components/calendar/interview-calendar";
import { getCalendarEvents } from "@/lib/actions";

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div>
      <TopBar
        title="Calendar"
        description="Interview dates and application deadlines."
      />
      <InterviewCalendar applications={events} />
    </div>
  );
}
