import Link from "next/link";
import { Suspense } from "react";
import {
  Briefcase,
  CalendarCheck2,
  Gift,
  Percent,
  Plus,
  XCircle,
} from "lucide-react";
import { TopBar } from "@/components/layout/sidebar";
import { StatCard } from "@/components/stat-card";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { StatusPieChart } from "@/components/charts/status-pie";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PeriodFilter } from "@/components/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAllApplications, getRecentApplications } from "@/lib/actions";
import {
  availableYears,
  availableStartYears,
  chartDataForPeriod,
  computeStats,
  filterByPeriod,
  formatPeriodLabel,
  parsePeriodFromSearchParams,
  statusDistribution,
} from "@/lib/analytics";

type SearchParams = Promise<{
  year?: string;
  month?: string;
  jobType?: string;
  startYear?: string;
}>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const period = parsePeriodFromSearchParams(params);

  const [allApps, recent] = await Promise.all([
    getAllApplications(),
    getRecentApplications(8),
  ]);

  const years = availableYears(allApps);
  const startYears = availableStartYears(allApps);
  const apps = filterByPeriod(allApps, period);
  const stats = computeStats(apps);
  const monthly = chartDataForPeriod(
    period.year ? filterByPeriod(allApps, { ...period, month: null }) : apps,
    period,
    6
  );
  const statusData = statusDistribution(apps);
  const periodLabel = formatPeriodLabel(period);

  return (
    <div>
      <TopBar
        title="Dashboard"
        description={`Pipeline overview · ${periodLabel}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Suspense fallback={null}>
              <PeriodFilter years={years} startYears={startYears} />
            </Suspense>
            <Link
              href="/applications/new"
              className={cn(buttonVariants(), "h-9 rounded-xl")}
            >
              <Plus className="size-4" />
              Add Application
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Applications"
          value={stats.total}
          subtitle="Excluding wishlist"
          icon={Briefcase}
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          subtitle={`${stats.interviewRate}% interview rate`}
          icon={CalendarCheck2}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Offers"
          value={stats.offers}
          subtitle={`${stats.offerRate}% offer rate`}
          icon={Gift}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Rejections"
          value={stats.rejections}
          icon={XCircle}
          accent="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
        <StatCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          subtitle="Any reply past applied"
          icon={Percent}
          accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {period.year ? `Applications in ${period.year}` : "Applications over time"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={monthly} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Status distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={statusData} />
          </CardContent>
        </Card>
      </div>

      <RecentActivity applications={recent} />
    </div>
  );
}
