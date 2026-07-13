"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { ImagePlus, Link2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ExtractedJob } from "@/lib/validations";
import { importFromJobImage, importFromJobUrl } from "@/lib/actions";

type Props = {
  enabled: boolean;
  onImported: (data: ExtractedJob) => void;
};

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve({ base64: result, mimeType: file.type || "image/png" });
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function JobImport({ enabled, onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleResult = useCallback(
    (result: { data?: ExtractedJob; error?: string }) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        onImported(result.data);
        toast.success("Fields filled from import — review before saving.");
      }
    },
    [onImported]
  );

  function runUrlImport(rawUrl: string) {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      toast.error("Paste a job posting URL first.");
      return;
    }
    startTransition(async () => {
      const result = await importFromJobUrl(trimmed);
      handleResult(result);
    });
  }

  function runImageImport(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Drop an image screenshot (PNG, JPEG, WEBP).");
      return;
    }
    startTransition(async () => {
      try {
        const payload = await fileToBase64(file);
        const result = await importFromJobImage(payload);
        handleResult(result);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to read image");
      }
    });
  }

  function onPaste(e: React.ClipboardEvent) {
    if (!enabled || isPending) return;

    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        e.preventDefault();
        runImageImport(file);
        return;
      }
    }

    const text = e.clipboardData.getData("text").trim();
    if (/^https?:\/\//i.test(text)) {
      e.preventDefault();
      setUrl(text);
      runUrlImport(text);
    }
  }

  return (
    <div
      onPaste={onPaste}
      className={cn(
        "rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 transition-colors sm:p-5",
        dragging && "border-primary bg-primary/5",
        !enabled && "opacity-80"
      )}
      onDragEnter={(e) => {
        e.preventDefault();
        if (enabled) setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (enabled) setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!enabled || isPending) return;
        const file = e.dataTransfer.files?.[0];
        if (file) runImageImport(file);
      }}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Import from link or screenshot</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Paste a job URL, drop a screenshot, or paste an image from your clipboard.
            Gemini will fill company, title, location, and more.
          </p>
        </div>
      </div>

      {!enabled ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Set <code className="font-mono">GEMINI_API_KEY</code> in your environment
          (and Vercel) to enable import.
        </p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runUrlImport(url);
                }
              }}
              disabled={isPending}
              placeholder="https://careers.example.com/job/…"
              className="h-10 rounded-xl pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              className="h-10 rounded-xl"
              disabled={isPending}
              onClick={() => runUrlImport(url)}
            >
              {isPending ? "Importing…" : "Import URL"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="size-4" />
              Screenshot
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) runImageImport(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
