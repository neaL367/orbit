"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface AnimeDescriptionProps {
    description?: string | null
}

export function AnimeDescription({ description }: AnimeDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!description) {
        return (
            <div className="font-mono text-sm text-muted-foreground">
                No_Data_Available
            </div>
        )
    }

    // Simple heuristic to decide if we show the button
    const isLong = description.length > 300

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "prose prose-sm max-w-2xl font-sans text-muted-foreground leading-relaxed dark:prose-invert",
                    !isExpanded && "line-clamp-4 mask-fade-bottom"
                )}
                dangerouslySetInnerHTML={{ __html: description }}
            />

            {isLong && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground hover:text-foreground/70 transition-colors border border-border px-3 py-1.5 bg-background/50 hover:bg-secondary/50 group"
                >
                    <span className="relative">
                        {isExpanded ? "Collapse_Data" : "Expand_Data"}
                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-foreground transition-all group-hover:w-full" />
                    </span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
            )}
        </div>
    )
}
