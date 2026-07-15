import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./config";
import { createTranslator } from "./index";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const accept = (await headers()).get("accept-language") ?? "";
  if (accept.toLowerCase().includes("ko")) return "ko";
  return DEFAULT_LOCALE;
}

export async function getTranslator() {
  const locale = await getLocale();
  return { locale, t: createTranslator(locale) };
}
