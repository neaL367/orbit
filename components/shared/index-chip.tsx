import { cn } from "@/lib/utils"
import React from "react"

interface IndexChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean
    label: string
}

export function IndexChip({ label, active, className, ...props }: IndexChipProps) {
    return (
        <button
            className={cn(
                "relative px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                "border border-border",
                active
                    ? "bg-foreground text-background border-foreground shadow-lg shadow-white/5"
                    : "text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-white/[0.04]",
                active && "index-notch",
                className
            )}
            {...props}
        >
            <span className={cn(
                "relative z-10"
            )}>
                {label}
            </span>
        </button>
    )
}
