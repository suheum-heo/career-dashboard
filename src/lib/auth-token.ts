export const SESSION_COOKIE = "careertrack_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function authConfigured() {
  return Boolean(process.env.DASHBOARD_PASSWORD && process.env.AUTH_SECRET);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const pad = (4 - (value.length % 4)) % 4;
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat(pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(value: string) {
  const secret = process.env.AUTH_SECRET ?? "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))
  );
}

async function passwordTag() {
  const mac = await sign(`tag:${process.env.DASHBOARD_PASSWORD ?? ""}`);
  return toBase64Url(mac).slice(0, 16);
}

export async function createSessionToken() {
  const payload = toBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        exp: Date.now() + SESSION_MAX_AGE * 1000,
        tag: await passwordTag(),
      })
    )
  );
  const signature = toBase64Url(await sign(payload));
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token || !authConfigured()) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  let actual: Uint8Array;
  try {
    actual = fromBase64Url(signature);
  } catch {
    return false;
  }
  const expected = await sign(payload);
  if (!timingSafeEqual(actual, expected)) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      exp?: number;
      tag?: string;
    };
    return (
      typeof data.exp === "number" &&
      data.exp > Date.now() &&
      data.tag === (await passwordTag())
    );
  } catch {
    return false;
  }
}

/** Compare without leaking the password through an early length check. */
export async function passwordMatches(input: string) {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected || !process.env.AUTH_SECRET) return false;
  const actual = await sign(`password:${input}`);
  const wanted = await sign(`password:${expected}`);
  return timingSafeEqual(actual, wanted);
}
