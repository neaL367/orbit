"use client";

import { useTransitionRouter } from "next-view-transitions";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

export function Navigation() {
  const router = useTransitionRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/", );
    }
  };

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
