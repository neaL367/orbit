'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface IndexImageProps extends ImageProps {
    containerClassName?: string
    showTechnicalDetails?: boolean
}


export function IndexImage({
    className,
    containerClassName,
    alt,
    showTechnicalDetails = true,
    ...props
}: IndexImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [registryId] = useState(() => `0x${Math.random().toString(16).slice(2, 8).toUpperCase()}`)

    return (
        <div className={cn(
            "relative overflow-hidden bg-secondary border border-border/50 transition-all duration-700 select-none group/img",
            isLoading ? "shimmer" : "bg-secondary/10",
            props.fill && "w-full h-full",
            containerClassName
        )}>
            {/* Blueprint Grid Overlay (Always present but fades after load) */}
            <div className={cn(
                "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-10 transition-opacity duration-1000",
                isLoading ? "opacity-30" : "opacity-0 group-hover/img:opacity-10"
            )} />

            {/* Technical Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                    <div className="space-y-4 text-center">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-[1px] bg-primary/20" />
                            <span className="font-mono text-[8px] uppercase tracking-[0.5em] text-muted-foreground/40 animate-pulse">
                                Syncing_Buffer
                            </span>
                            <div className="w-6 h-[1px] bg-primary/20" />
                        </div>
                    </div>
                </div>
            )}

            <Image
                alt={alt}
                className={cn(
                    "transition-all duration-1000 ease-out-expo object-cover",
                    isLoading ? "opacity-0 scale-110 blur-md grayscale" : "opacity-100 scale-100 blur-0 grayscale-0",
                    className
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                {...props}
            />

            {/* Technical Metadata Bar (Bottom) */}
            {showTechnicalDetails && (
                <div className={cn(
                    "absolute bottom-0 left-0 w-full px-3 py-1.5 flex justify-between items-center bg-black/60 backdrop-blur-md border-t border-white/5 transition-all duration-700 z-30",
                    isLoading ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-primary/40 animate-pulse" />
                        <span className="font-mono text-[7px] uppercase text-muted-foreground tracking-[0.3em]">
                            Registry_Verified
                        </span>
                    </div>
                    <span
                        className="font-mono text-[6px] uppercase text-muted-foreground/30"
                        suppressHydrationWarning
                    >
                        {registryId}
                    </span>
                </div>
            )}

            {/* Corner Bracket Decorators */}
            <div className={cn(
                "absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 transition-opacity duration-700 z-30",
                isLoading ? "opacity-100" : "opacity-0"
            )} />
            <div className={cn(
                "absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/10 transition-opacity duration-700 z-30",
                isLoading ? "opacity-100" : "opacity-0"
            )} />
        </div>
    )
}
