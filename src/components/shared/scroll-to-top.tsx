"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
    const { show, scrollToTop } = useScrollToTop(600)

    return (
        <button
            onClick={scrollToTop}
            className={cn(
                "fixed bottom-12 right-12 z-[100] p-4 border border-border bg-background/80 backdrop-blur-sm transition-all duration-500",
                show
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
            )}
            aria-label="Scroll to top"
        >
            <ArrowUp className="h-4 w-4 text-foreground" />
            <div className="absolute top-0 right-0 w-[1px] h-0 bg-foreground group-hover:h-full transition-all" />
            <div className="absolute bottom-0 right-0 w-0 h-[1px] bg-foreground group-hover:w-full transition-all" />
        </button>
    )
}
