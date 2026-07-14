"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Thin client wrapper so server StatCards can stay serializable. */
export function PressableLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Link
      href={href}
      prefetch
      data-pressed={pressed ? "true" : "false"}
      onClick={() => setPressed(true)}
      onBlur={() => setPressed(false)}
      className={cn(className)}
    >
      {children}
    </Link>
  );
}
