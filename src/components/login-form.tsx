"use client";

import { useActionState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/components/locale-provider";
import { login, type LoginState } from "@/lib/auth-actions";

export function LoginForm() {
  const { t } = useLocale();
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <form action={action} className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo className="size-12" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("login.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("login.description")}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("login.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="h-10 rounded-xl"
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-destructive">
          {state.error === "unconfigured" ? t("login.unconfigured") : t("login.invalid")}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-10 w-full rounded-xl">
        {pending ? t("common.saving") : t("login.submit")}
      </Button>
    </form>
  );
}
