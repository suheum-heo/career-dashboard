import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractedJobSchema, type ExtractedJob } from "@/lib/validations";

export type { ExtractedJob };

const EXTRACTION_PROMPT = `Extract job details. Return ONLY JSON:
{"company":string|null,"jobTitle":string|null,"location":string|null,"salary":string|null,"jobLink":string|null,"notes":string|null,"deadline":string|null}
deadline must be YYYY-MM-DD or null. Prefer null over guessing. notes: one short line max.`;

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
  return message.includes("404") || message.toLowerCase().includes("not found");
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
  // Keep prompts small to stay under free-tier token limits
  return text.slice(0, 6000);
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

  const extracted = parseGeminiJson(text);
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
    "The content is a screenshot of a job posting.",
    {
      inlineData: {
        mimeType: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
        data,
      },
    },
  ]);

  return parseGeminiJson(text);
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
