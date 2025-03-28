"use client";

import { useState } from "react";

export function AnimeDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 500; // Adjust the limit as needed

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border/50 ">
      <p className="text-sm sm:text-base whitespace-pre-line text-muted-foreground leading-relaxed transition">
        {isExpanded ? description : `${description.slice(0, maxLength)}...`}
      </p>
      {description.length > maxLength && (
        <div className="flex justify-center">
          <button
            onClick={toggleExpanded}
            className="mt-5 text-gray-200 font-bold underline hover:cursor-pointer"
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        </div>
      )}
    </div>
  );
}
