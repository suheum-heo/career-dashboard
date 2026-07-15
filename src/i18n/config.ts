export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "careertrack-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "ko";
}
