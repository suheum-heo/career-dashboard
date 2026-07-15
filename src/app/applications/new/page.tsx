import { TopBar } from "@/components/layout/sidebar";
import { ApplicationForm } from "@/components/applications/application-form";
import { Card, CardContent } from "@/components/ui/card";
import { getGeminiConfigured } from "@/lib/actions";
import { getTranslator } from "@/i18n/server";

export default async function NewApplicationPage() {
  const [geminiConfigured, { t }] = await Promise.all([
    getGeminiConfigured(),
    getTranslator(),
  ]);

  return (
    <div>
      <TopBar
        title={t("applications.addTitle")}
        description={t("applications.addDescription")}
      />
      <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6 sm:p-8">
          <ApplicationForm geminiConfigured={geminiConfigured} />
        </CardContent>
      </Card>
    </div>
  );
}
