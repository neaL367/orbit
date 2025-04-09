"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navigator() {
  const router = useRouter();

  const handleBack = () => {
    // Store current scroll position in sessionStorage before navigating back
    if (typeof window !== 'undefined') {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      sessionStorage.setItem('scrollPosition', scrollPosition.toString());
    }
    router.back();
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full group hover:cursor-pointer hover:bg-zinc-400 transition-all"
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Go back</span>
    </Button>
  );
}
