import {
  Briefcase,
  CalendarCheck2,
  Gift,
  Percent,
} from "lucide-react";
import { TopBar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/stat-card";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { PipelineSankey } from "@/components/charts/pipeline-sankey";
import { LocationChart } from "@/components/charts/location-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllApplications } from "@/lib/actions";
import {
  computeStats,
  locationCounts,
  monthlyApplicationCounts,
  pipelineFunnel,
  sankeyData,
} from "@/lib/analytics";

export default async function AnalyticsPage() {
  const apps = await getAllApplications();
  const stats = computeStats(apps);
  const monthly = monthlyApplicationCounts(apps, 8);
  const locations = locationCounts(apps);
  const funnel = pipelineFunnel(apps);
  const sankey = sankeyData(apps);

  return (
    <div>
      <TopBar
        title="Analytics"
        description="Conversion rates, geography, and hiring pipeline."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Applications"
          value={stats.total}
          icon={Briefcase}
        />
        <StatCard
          title="Interview rate"
          value={`${stats.interviewRate}%`}
          icon={CalendarCheck2}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Offer rate"
          value={`${stats.offerRate}%`}
          icon={Gift}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Response rate"
          value={`${stats.responseRate}%`}
          icon={Percent}
          accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Applications over time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={monthly} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Most common locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationChart data={locations} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Hiring funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnel} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Pipeline flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineSankey data={sankey} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
