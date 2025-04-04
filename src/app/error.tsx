"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AnimeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // If it's a rate limit error, start a countdown
    if (error.message.includes("429")) {
      setCountdown(15);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [error]);

  // Auto-retry after countdown
  useEffect(() => {
    if (countdown === null && error.message.includes("429")) {
      reset();
    }
  }, [countdown, error, reset]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>

      {error.message.includes("429") ? (
        <>
          <p className="text-muted-foreground mb-6 max-w-md">
            We&apos;ve hit AniList&apos;s rate limit. This happens when there are too many
            requests in a short period.
          </p>

          {countdown ? (
            <div className="flex items-center gap-2 text-primary">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Retrying in {countdown} seconds...</span>
            </div>
          ) : (
            <Button onClick={reset} className="flex items-center gap-2 hover:cursor-pointer">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error.message || "An unexpected error occurred"}
          </p>
          <Button onClick={reset} className="hover:cursor-pointer">Try again</Button>
        </>
      )}
    </div>
  );
}
