"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AnimeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error.message.includes("429")
          ? "We've hit the AniList API rate limit. Please wait a moment and try again."
          : "There was an error loading the anime details. Please try again."}
      </p>
      <Button onClick={() => reset()} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
