import { Suspense } from "react";
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
import { PeriodFilter } from "@/components/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllApplications } from "@/lib/actions";
import {
  availableYears,
  availableStartYears,
  chartDataForPeriod,
  computeStats,
  filterByPeriod,
  formatPeriodLabel,
  locationCounts,
  parsePeriodFromSearchParams,
  pipelineFunnel,
  sankeyData,
} from "@/lib/analytics";

type SearchParams = Promise<{
  year?: string;
  month?: string;
  jobType?: string;
  startYear?: string;
}>;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const period = parsePeriodFromSearchParams(params);
  const allApps = await getAllApplications();
  const years = availableYears(allApps);
  const startYears = availableStartYears(allApps);
  const apps = filterByPeriod(allApps, period);
  const stats = computeStats(apps);
  const monthly = chartDataForPeriod(
    period.year ? filterByPeriod(allApps, { ...period, month: null }) : apps,
    period,
    8
  );
  const locations = locationCounts(apps);
  const funnel = pipelineFunnel(apps);
  const sankey = sankeyData(apps);
  const periodLabel = formatPeriodLabel(period);

  return (
    <div>
      <TopBar
        title="Analytics"
        description={`Conversion, geography, and pipeline · ${periodLabel}`}
        actions={
          <Suspense fallback={null}>
            <PeriodFilter years={years} startYears={startYears} />
          </Suspense>
        }
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
              {period.year ? `Applications in ${period.year}` : "Applications over time"}
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
