"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface NSFWToggleProps {
  onChange: (showNSFW: boolean) => void;
}

export default function NSFWToggle({ onChange }: NSFWToggleProps) {
  const [showNSFW, setShowNSFW] = useState(false);

  const handleToggleChange = (checked: boolean) => {
    setShowNSFW(checked);
    onChange(checked);
  };

  return (
    <div className="flex items-center space-x-2 p-2 rounded-md">
      <AlertCircle className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="nsfw-toggle" className="text-sm cursor-pointer">
        Show NSFW/R18 Content
      </Label>
      <Switch
        id="nsfw-toggle"
        checked={showNSFW}
        onCheckedChange={handleToggleChange}
        aria-label="Toggle NSFW content"
      />
    </div>
  );
}
