"use client"

import { useState, useEffect } from 'react'
import { BackButton } from "@/components/shared/back-button"
import { cn } from "@/lib/utils"
import type { Media } from '@/lib/graphql/types/graphql'

interface AnimeRegistryNavProps {
    anime: Media
    title: string
}

export function AnimeRegistryNav({ anime, title }: AnimeRegistryNavProps) {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 150
            setIsScrolled(scrolled)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial check

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div
            className={cn(
                "fixed left-0 right-0 z-100 transition-all duration-500 ease-out group/ctx-nav border-b border-transparent will-change-transform",
                isScrolled ? "bg-background/70 backdrop-blur-xl border-white/5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] scrolled" : "bg-transparent"
            )}
            id="registry-nav"
            style={{ top: 'calc(var(--nav-visible, 1) * 80px)' }}
        >
            {/* Content Container */}
            <div className="max-w-[1790px] mx-auto w-full px-6 md:px-12 lg:px-24 py-4 relative z-10">
                <div className="flex items-center gap-6">
                    {/* Navigation Action - Always Visible */}
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <div className={cn(
                            "hidden md:block w-px h-8 transition-colors",
                            isScrolled ? "bg-primary/20" : "bg-white/10"
                        )} />
                    </div>

                    {/* Title Section - Fades in on scroll */}
                    <div className={cn(
                        "flex-1 flex items-center gap-4 transition-all duration-700 will-change-transform",
                        isScrolled
                            ? "opacity-100 translate-x-0 pointer-events-auto"
                            : "opacity-0 translate-x-4 pointer-events-none"
                    )}>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="w-10 h-12 border border-primary/20 bg-secondary/20 relative overflow-hidden shrink-0">
                                {anime.coverImage?.large && (
                                    <img src={anime.coverImage.large} alt="" className="w-full h-full object-cover opacity-60 grayscale" />
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-primary/40 leading-none">
                                    REGISTRY_ENTRY // {anime.id}
                                </span>
                                <h2 className="font-mono text-sm font-black uppercase tracking-tighter truncate max-w-[300px] lg:max-w-md text-foreground">
                                    {title}
                                </h2>
                            </div>
                        </div>
                    </div>


                    {/* Separator Line */}
                    <div className={cn(
                        "flex-1 h-px transition-all duration-700",
                        isScrolled ? "bg-primary/10 opacity-100" : "bg-white/5 opacity-0"
                    )} />

                    {/* Technical Metadata */}
                    <div className={cn(
                        "flex flex-col items-end shrink-0 transition-all duration-700",
                        isScrolled ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                    )}>
                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 leading-none">
                            {anime.status}
                        </span>
                        <div className={cn(
                            "flex gap-1 mt-1.5 transition-opacity",
                            isScrolled ? "opacity-100" : "opacity-40"
                        )}>
                            <div className="w-12 h-0.5 bg-primary/20" />
                            <div className="w-4 h-0.5 bg-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
