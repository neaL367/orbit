import { cn } from "@/lib/utils"
import React from "react"

interface IndexPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function IndexPanel({ children, className, ...props }: IndexPanelProps) {
    return (
        <div
            className={cn(
                "relative border border-border p-6 reveal",
                className
            )}
            {...props}
        >
            {/* Index Cut Visual Decoration */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-muted-foreground/20" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-muted-foreground/20" />
            {children}
        </div>
    )
}
