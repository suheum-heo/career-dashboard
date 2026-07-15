"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ChartColumn,
  CalendarDays,
  Plus,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import { useState } from "react";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLocale();

  const nav = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/applications", label: t("nav.applications"), icon: Briefcase },
    { href: "/analytics", label: t("nav.analytics"), icon: ChartColumn },
    { href: "/calendar", label: t("nav.calendar"), icon: CalendarDays },
  ];

  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  const { t } = useLocale();
  return (
    <Link href="/" className="flex items-center gap-2.5 px-1">
      <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Briefcase className="size-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight">{t("brand.name")}</p>
        <p className="text-[11px] text-muted-foreground">{t("brand.tagline")}</p>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const { t } = useLocale();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl md:flex md:flex-col">
      <div className="flex h-16 items-center px-5">
        <SidebarBrand />
      </div>
      <div className="flex flex-1 flex-col gap-6 px-3 py-2">
        <NavLinks />
        <div className="mt-auto space-y-3 px-1 pb-4">
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="flex-1" />
            <ThemeToggle />
          </div>
          <Link
            href="/applications/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-9 w-full rounded-xl shadow-sm"
            )}
          >
            <Plus className="size-4" />
            {t("nav.addApplication")}
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">{t("nav.navigation")}</SheetTitle>
            <div className="flex h-16 items-center px-5">
              <SidebarBrand />
            </div>
            <div className="px-3 py-2">
              <NavLinks onNavigate={() => setOpen(false)} />
              <div className="mt-6 space-y-3">
                <LanguageSwitcher className="w-full" />
                <Link
                  href="/applications/new"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "h-9 w-full rounded-xl"
                  )}
                >
                  <Plus className="size-4" />
                  {t("nav.addApplication")}
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <SidebarBrand />
      </div>
      <div className="flex items-center gap-1">
        <LanguageSwitcher className="w-[110px]" />
        <ThemeToggle />
      </div>
    </header>
  );
}

export function TopBar({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
