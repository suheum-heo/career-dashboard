import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractedJobSchema, type ExtractedJob } from "@/lib/validations";

export type { ExtractedJob };

const EXTRACTION_PROMPT = `Extract job application fields from the posting. Return ONLY JSON:
{
  "company": string | null,
  "jobTitle": string | null,
  "location": string | null,
  "salary": string | null,
  "jobLink": string | null,
  "notes": string | null,
  "deadline": string | null,
  "jobType": "INTERNSHIP" | "FULL_TIME" | null,
  "startYear": number | null
}

Field rules:
- jobTitle: concise ROLE title only (what you'd put on a resume / tracker). Examples:
  - "2027 Commercial & Investment Bank - Markets Summer Analyst Program - Seoul" → "Markets Summer Analyst"
  - "2026 Software Engineer Intern - Cupertino, CA" → "Software Engineer Intern"
  - "Summer Analyst Program, Investment Banking" → "Investment Banking Summer Analyst"
  Strip: leading years, trailing city/country, bank/division path prefixes, and words like "Program" when the role is already clear.
  Put the year in startYear and the city in location instead. Never return the full marketing headline.
- location: city, state/region, country, "Remote", hybrid, or office name exactly as shown (e.g. "San Francisco, CA", "Remote - US", "Seoul, Korea"). Look near the title, job meta row, and labels like Location / Offices / Workplace.
- salary: pay, compensation, base, range, or hourly rate exactly as shown (e.g. "$120k-$150k", "$45/hr", "₩80,000,000"). Look for Salary / Compensation / Pay / Base / Total rewards. Include currency and range when present.
- jobType: INTERNSHIP for intern/co-op/summer analyst roles, FULL_TIME for new grad or experienced full-time roles.
- startYear: the year the role starts (e.g. Summer 2027 intern → 2027). Not the application year.
- deadline: YYYY-MM-DD only if an application deadline is explicit, else null
- notes: one short line max
- Prefer null over guessing. Do not invent location or salary.`;

/** Current models for new API keys; override with GEMINI_MODEL. */
const DEFAULT_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
];

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to .env and Vercel environment variables."
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

function modelCandidates(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  if (preferred) {
    return [preferred, ...DEFAULT_MODELS.filter((m) => m !== preferred)];
  }
  return DEFAULT_MODELS;
}

function getModel(modelName: string) {
  return getGemini().getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });
}

function isQuotaError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("429") ||
    message.includes("Too Many Requests") ||
    message.includes("quota") ||
    message.includes("RESOURCE_EXHAUSTED")
  );
}

function isModelMissingError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  return (
    message.includes("404") ||
    lower.includes("not found") ||
    lower.includes("no longer available") ||
    lower.includes("not supported")
  );
}

function friendlyQuotaError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  const retryMatch = message.match(/retry in ([\d.]+)s/i);
  const wait = retryMatch ? Math.ceil(Number(retryMatch[1])) : null;
  return new Error(
    wait
      ? `Gemini rate limit — wait ~${wait}s, then try once. If this keeps happening, create a new API key in a new Google AI Studio project (quotas are per project).`
      : "Gemini free-tier limit reached. Wait a bit, or create a new API key in a new AI Studio project."
  );
}

/**
 * Try one primary model. Only fall back if the model is missing (404),
 * never on 429 — cascading retries burns free-tier quota faster.
 */
async function generateWithFallback(
  parts: Parameters<ReturnType<typeof getModel>["generateContent"]>[0]
): Promise<string> {
  const models = modelCandidates();
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const result = await getModel(modelName).generateContent(parts);
      return result.response.text();
    } catch (err) {
      lastError = err;
      if (isQuotaError(err)) {
        throw friendlyQuotaError(err);
      }
      if (isModelMissingError(err)) {
        continue;
      }
      throw err;
    }
  }

  if (isQuotaError(lastError)) {
    throw friendlyQuotaError(lastError);
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed.");
}

function parseGeminiJson(text: string): ExtractedJob {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  return extractedJobSchema.parse(parsed);
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull salary/location-looking lines to the front so truncation keeps them. */
function prioritizeMetaSnippets(text: string): string {
  const metaPattern =
    /\b(location|locations|office|offices|workplace|remote|hybrid|on[\s-]?site|salary|compensation|pay|base\s*pay|hourly|wage|stipend|total\s*rewards|\$|₩|€|£|CAD|USD|KRW)\b/i;

  const sentences = text
    .split(/(?<=[.!?])\s+|\n+|(?<=;)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8 && s.length < 280);

  const hits = sentences.filter((s) => metaPattern.test(s)).slice(0, 20);
  if (!hits.length) return text;

  const prioritized = Array.from(new Set(hits)).join(" | ");
  return `Job meta hints: ${prioritized}\n\n${text}`;
}

const ROLE_HINT =
  /\b(Analyst|Associate|Engineer|Intern|Internship|Developer|Scientist|Designer|Manager|Director|Trader|Banker|Researcher|Consultant|Specialist|Coordinator|Officer|Summer|Co-?op)\b/i;

function isYearPart(part: string) {
  return /^20\d{2}$/.test(part.trim());
}

function isLocationPart(part: string) {
  const p = part.trim();
  if (!p) return false;
  if (/^Remote(?:\b|\s)/i.test(p)) return true;
  if (/^[가-힣]{1,12}(?:시|특별시|광역시|도)?$/.test(p)) return true;
  // "Seoul", "Cupertino, CA", "New York, NY", "Hong Kong"
  if (/^[A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*){0,2}(?:,\s*[A-Z]{2})?$/.test(p)) {
    return !ROLE_HINT.test(p);
  }
  return false;
}

function isOrgPathPart(part: string) {
  const p = part.trim();
  if (ROLE_HINT.test(p)) return false;
  return /(?:Bank|Banking|Markets|Division|Group|Business|Institutional|Corporate|Commercial|Investment)\b/i.test(
    p
  );
}

/** Trim marketing headline noise into a concise role title. */
export function normalizeJobTitle(title?: string | null): string | null {
  let t = title?.trim() ?? "";
  if (!t) return null;

  // Soft-split "Year Role - City" and "Year - Org - Role - City"
  let parts = t
    .split(/\s*[-–—|]\s*/u)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts[0] && isYearPart(parts[0])) {
    parts = parts.slice(1);
  } else if (parts[0]) {
    parts[0] = parts[0].replace(/^(?:20\d{2})\s+/u, "").trim();
    if (!parts[0]) parts = parts.slice(1);
  }

  while (parts.length > 1 && isLocationPart(parts[parts.length - 1]!)) {
    parts.pop();
  }

  while (parts.length > 1 && isOrgPathPart(parts[0]!)) {
    parts = parts.slice(1);
  }

  // If one long leftover part still starts with an org path before a role word, cut the prefix
  if (parts.length === 1) {
    const only = parts[0]!;
    const roleMatch = only.match(ROLE_HINT);
    if (roleMatch?.index && roleMatch.index > 0) {
      const before = only.slice(0, roleMatch.index).trim();
      if (isOrgPathPart(before) || /(?:Bank|Banking|Markets)\b/i.test(before)) {
        // Prefer from the role word, but keep a short qualifier just before it (e.g. "Markets Summer Analyst")
        const words = only.split(/\s+/);
        const roleWordIdx = words.findIndex((w) => ROLE_HINT.test(w));
        if (roleWordIdx >= 0) {
          const start = Math.max(0, roleWordIdx - 1);
          parts = [words.slice(start).join(" ")];
        }
      }
    }
  }

  t = parts.join(" ").replace(/\s+/g, " ").trim();
  t = t.replace(/\s+Programs?\s*$/iu, "").trim();

  return t || null;
}

function normalizeExtracted(data: ExtractedJob): ExtractedJob {
  const clean = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };
  return {
    company: clean(data.company),
    jobTitle: normalizeJobTitle(data.jobTitle),
    location: clean(data.location),
    salary: clean(data.salary),
    jobLink: clean(data.jobLink),
    notes: clean(data.notes),
    deadline: clean(data.deadline),
    jobType: data.jobType ?? null,
    startYear:
      typeof data.startYear === "number" && Number.isFinite(data.startYear)
        ? data.startYear
        : null,
  };
}

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(
      `Could not fetch that page (${res.status}). Try dropping a screenshot instead.`
    );
  }

  const html = await res.text();
  const text = htmlToText(html);
  if (text.length < 40) {
    throw new Error(
      "That page returned little usable text (often blocked). Try dropping a screenshot instead."
    );
  }
  return prioritizeMetaSnippets(text).slice(0, 10000);
}

export async function extractFromUrl(url: string): Promise<ExtractedJob> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Enter a valid job posting URL.");
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("URL must start with http:// or https://");
  }

  const pageText = await fetchPageText(parsedUrl.toString());
  const text = await generateWithFallback([
    EXTRACTION_PROMPT,
    `Source URL: ${parsedUrl.toString()}`,
    `Page content:\n${pageText}`,
  ]);

  const extracted = normalizeExtracted(parseGeminiJson(text));
  return {
    ...extracted,
    jobLink: extracted.jobLink || parsedUrl.toString(),
  };
}

export async function extractFromImage(
  base64: string,
  mimeType: string
): Promise<ExtractedJob> {
  const allowed = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
  ]);
  if (!allowed.has(mimeType)) {
    throw new Error("Use a PNG, JPEG, WEBP, or GIF screenshot.");
  }

  const data = base64.includes(",") ? base64.split(",")[1]! : base64;
  if (!data || data.length < 100) {
    throw new Error("Image data looks empty. Try another screenshot.");
  }

  if (data.length > 5_500_000) {
    throw new Error("Image is too large. Try a smaller crop or compressed screenshot.");
  }

  const text = await generateWithFallback([
    EXTRACTION_PROMPT,
    "This is a screenshot of a job posting. Read visible location and salary/compensation text carefully.",
    {
      inlineData: {
        mimeType: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
        data,
      },
    },
  ]);

  return normalizeExtracted(parseGeminiJson(text));
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
