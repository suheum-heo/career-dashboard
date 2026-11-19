"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  authConfigured,
  createSessionToken,
  passwordMatches,
} from "@/lib/auth-token";

export type LoginState = { error?: "invalid" | "unconfigured" } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!authConfigured()) return { error: "unconfigured" };
  const password = String(formData.get("password") ?? "");
  if (!(await passwordMatches(password))) return { error: "invalid" };

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
