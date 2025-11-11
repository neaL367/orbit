"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function NsfwToggle({
  onChange,
}: {
  onChange: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("nsfw_enabled") === "true";
    }
    return false;
  });

  const toggleNSFW = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    sessionStorage.setItem("nsfw_enabled", newValue ? "true" : "false");
    onChange(newValue);
  };

  return (
    <Button suppressHydrationWarning onClick={toggleNSFW} variant="outline">
      {enabled ? "NSFW: ON" : "NSFW: OFF"}
    </Button>
  );
}
