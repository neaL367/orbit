"use client";

import { useTransitionRouter } from "next-view-transitions";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";
import { useEffect, useCallback } from "react";

export function Navigation() {
  const router = useTransitionRouter();

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      // Add a small delay to allow any pending operations to complete
      setTimeout(() => {
        router.back();
      }, 10);
    } else {
      router.push("/"); // fallback route (home page)
    }
  }, [router]);

  // Register a cleanup function to handle any pending navigation
  useEffect(() => {
    return () => {
      // This helps ensure any pending navigation operations are properly cleaned up
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CLEAR_PENDING_NAVIGATION",
        });
      }
    };
  }, []);

  return (
    <Button
      size="sm"
      onClick={handleBack}
      className="gap-1 hover:cursor-pointer absolute -top-16 left-0 bg-zinc-900 hover:bg-zinc-800"
    >
      <ChevronLeft className="h-4 w-4" /> Back
    </Button>
  );
}
