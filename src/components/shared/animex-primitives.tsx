"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface AnimexPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

/**
 * A clean, border-less or subtle border container
 */
export function AnimexPanel({ children, className, ...props }: AnimexPanelProps) {
    return (
        <div className={cn("bg-[#0A0A0A] border-subtle p-8", className)} {...props}>
            {children}
        </div>
    )
}

interface AnimexChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean
    label: string
}

/**
 * Minimalist pill/text selector
 */
export function AnimexChip({ label, active, className, ...props }: AnimexChipProps) {
    return (
        <button
            className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-all duration-500 py-1 border-b-2",
                active
                    ? "border-primary text-primary text-glow"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                className
            )}
            {...props}
        >
            {label}
        </button>
    )
}

export function AnimexSectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-12">
            <h2 className="text-4xl md:text-6xl font-display leading-[0.8] mb-4">
                {title}
            </h2>
            {subtitle && (
                <div className="flex items-center gap-4">
                    <div className="h-[1px] w-8 bg-primary/40" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
            )}
        </div>
    )
}
