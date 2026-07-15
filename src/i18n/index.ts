import { en, type Messages } from "./messages/en";
import { ko } from "./messages/ko";
import { DEFAULT_LOCALE, type Locale } from "./config";

const dictionaries: Record<Locale, Messages> = { en, ko };

type Leaves<T, P extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: Leaves<
        T[K],
        P extends "" ? K : `${P}.${K}`
      >;
    }[keyof T & string]
  : P;

export type MessageKey = Leaves<Messages>;

export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

function lookup(messages: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let cur: unknown = messages;
  for (const part of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function createTranslator(locale: Locale) {
  const messages = getMessages(locale);
  return function t(
    key: MessageKey | string,
    vars?: Record<string, string | number>
  ): string {
    let text = lookup(messages, key) ?? lookup(dictionaries.en, key) ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  };
}

export type Translator = ReturnType<typeof createTranslator>;
