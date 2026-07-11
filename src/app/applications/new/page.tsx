import { TopBar } from "@/components/layout/sidebar";
import { ApplicationForm } from "@/components/applications/application-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewApplicationPage() {
  return (
    <div>
      <TopBar
        title="Add application"
        description="Log a new internship or full-time opportunity."
      />
      <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6 sm:p-8">
          <ApplicationForm />
        </CardContent>
      </Card>
    </div>
  );
}
