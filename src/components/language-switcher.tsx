"use client";

import { useLocale } from "@/components/locale-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/i18n/config";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t, isPending } = useLocale();

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (value === "en" || value === "ko") setLocale(value as Locale);
      }}
    >
      <SelectTrigger
        className={`h-9 w-[120px] rounded-xl ${isPending ? "opacity-70" : ""} ${className ?? ""}`}
        aria-label={t("language.label")}
      >
        <SelectValue>
          {(value: string | null) =>
            value === "ko" ? t("language.ko") : t("language.en")
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t("language.en")}</SelectItem>
        <SelectItem value="ko">{t("language.ko")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
