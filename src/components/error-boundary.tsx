"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Error caught by boundary:", error);
      setHasError(true);
      setError(error.error || new Error("An unknown error occurred"));
    };

    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Something went wrong</h2>
        <p className="mb-4 text-muted-foreground">
          {error?.message ||
            "An unexpected error occurred while loading content"}
        </p>
        <Button
          onClick={() => {
            setHasError(false);
            setError(null);
            window.location.reload();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
