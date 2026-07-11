"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { ApplicationStatus } from "@prisma/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_STATUSES, STATUS_LABELS } from "@/lib/constants";

export function ApplicationFilters({ locations }: { locations: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "ALL") params.delete(key);
      else params.set(key, value);
    });
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (search === current) return;
      updateParams({ search: search || null });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center ${isPending ? "opacity-70" : ""}`}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, title, notes…"
          className="h-10 rounded-xl pl-9"
        />
      </div>
      <Select
        value={searchParams.get("status") ?? "ALL"}
        onValueChange={(value) => updateParams({ status: value ?? "ALL" })}
      >
        <SelectTrigger className="h-10 w-full rounded-xl sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          {ALL_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status as ApplicationStatus]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("location") ?? "ALL"}
        onValueChange={(value) => updateParams({ location: value ?? "ALL" })}
      >
        <SelectTrigger className="h-10 w-full rounded-xl sm:w-[200px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All locations</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {loc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
