"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function Navigator() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full group hover:cursor-pointer hover:bg-zinc-400 transition-all"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Go back</span>
    </Button>
  );
}
