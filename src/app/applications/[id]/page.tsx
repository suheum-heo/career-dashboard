import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/sidebar";
import { ApplicationForm } from "@/components/applications/application-form";
import { Card, CardContent } from "@/components/ui/card";
import { getApplication, getGeminiConfigured } from "@/lib/actions";
import { getTranslator } from "@/i18n/server";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ t }, application, geminiConfigured] = await Promise.all([
    getTranslator(),
    getApplication(id),
    getGeminiConfigured(),
  ]);
  if (!application) notFound();

  return (
    <div>
      <TopBar
        title={t("applications.editTitle")}
        description={t("applications.editDescription", {
          company: application.company,
        })}
      />
      <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6 sm:p-8">
          <ApplicationForm
            application={application}
            geminiConfigured={geminiConfigured}
          />
        </CardContent>
      </Card>
    </div>
  );
}
