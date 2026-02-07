"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
    className?: string
    label?: string
}

export function BackButton({ className, label = "Return" }: BackButtonProps) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className={cn(
                "group flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors z-50",
                className
            )}
        >
            <div className="p-2 border border-border/50 bg-background/50 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="group-hover:translate-x-1 transition-transform">{label}</span>
        </button>
    )
}
