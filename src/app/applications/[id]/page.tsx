import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/sidebar";
import { ApplicationForm } from "@/components/applications/application-form";
import { Card, CardContent } from "@/components/ui/card";
import { getApplication } from "@/lib/actions";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplication(id);
  if (!application) notFound();

  return (
    <div>
      <TopBar
        title={application.company}
        description={application.jobTitle}
      />
      <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6 sm:p-8">
          <ApplicationForm application={application} />
        </CardContent>
      </Card>
    </div>
  );
}
