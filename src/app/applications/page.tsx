import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { TopBar } from "@/components/layout/sidebar";
import { ApplicationFilters } from "@/components/applications/application-filters";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApplications, getLocations, getStartYears } from "@/lib/actions";

type SearchParams = Promise<{
  search?: string;
  status?: string;
  location?: string;
  jobType?: string;
  startYear?: string;
  metric?: string;
  year?: string;
  month?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: string;
}>;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [result, locations, startYears] = await Promise.all([
    getApplications({
      search: params.search,
      status: params.status,
      location: params.location,
      jobType: params.jobType,
      startYear: params.startYear,
      metric: params.metric,
      year: params.year,
      month: params.month,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      page,
    }),
    getLocations(),
    getStartYears(),
  ]);

  return (
    <div>
      <TopBar
        title="Applications"
        description="Search, filter, and manage every opportunity."
        actions={
          <Link
            href="/applications/new"
            className={cn(buttonVariants(), "h-9 rounded-xl")}
          >
            <Plus className="size-4" />
            Add Application
          </Link>
        }
      />

      <div className="mb-5">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-xl bg-muted" />}>
          <ApplicationFilters locations={locations} startYears={startYears} />
        </Suspense>
      </div>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
        <ApplicationsTable
          items={result.items}
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
        />
      </Suspense>
    </div>
  );
}
