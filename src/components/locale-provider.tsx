"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
} from "@/i18n/config";
import { createTranslator, type Translator } from "@/i18n";

type LocaleContextValue = {
  locale: Locale;
  t: Translator;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      document.documentElement.lang = next === "ko" ? "ko" : "en";
      startTransition(() => {
        router.refresh();
      });
    },
    [router]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      t: createTranslator(locale),
      setLocale,
      isPending,
    }),
    [locale, setLocale, isPending]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    const t = createTranslator(DEFAULT_LOCALE);
    return {
      locale: DEFAULT_LOCALE,
      t,
      setLocale: () => undefined,
      isPending: false,
    };
  }
  return ctx;
}
