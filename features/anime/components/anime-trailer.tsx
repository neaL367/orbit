"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

interface AnimeTrailerProps {
    videoId: string
    thumbnail?: string | null
}

export function AnimeTrailer({ videoId, thumbnail }: AnimeTrailerProps) {
    const [isPlaying, setIsPlaying] = useState(false)

    if (!videoId) return null

    // Fallback if no specific thumbnail provided
    const poster = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

    return (
        <div className="w-full max-w-4xl mx-auto border border-border bg-background p-1 relative group bg-dot-pattern">
            <div className="aspect-video w-full relative bg-black overflow-hidden border-b border-border">
                {!isPlaying ? (
                    <button
                        onClick={() => setIsPlaying(true)}
                        className="absolute inset-0 w-full h-full flex items-center justify-center group/btn cursor-pointer"
                        aria-label="Play Trailer"
                    >
                        {/* Thumbnail Image */}
                        <div className="absolute inset-0 bg-black">
                            <Image
                                src={poster}
                                alt="Trailer Thumbnail"
                                fill
                                sizes="(max-width: 1024px) 100vw, 896px"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover/btn:grayscale-0 group-hover/btn:opacity-80 transition-all duration-700 ease-out"
                            />
                        </div>

                        {/* Tech Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                        {/* Play Trigger Assembly */}
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center group-hover/btn:border-primary/50 group-hover/btn:bg-primary/10 transition-all duration-500 relative">
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50 group-hover/btn:border-primary transition-colors" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50 group-hover/btn:border-primary transition-colors" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50 group-hover/btn:border-primary transition-colors" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50 group-hover/btn:border-primary transition-colors" />

                                <Play className="w-8 h-8 text-white/80 group-hover/btn:text-primary fill-white/20 group-hover/btn:fill-primary/20 transition-all duration-300 ml-1" />
                            </div>
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 group-hover/btn:text-primary transition-colors">
                                Initialize_Playback
                            </span>
                        </div>

                        {/* Decorators */}
                        <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest text-white/40 pointer-events-none">
                            System_Preview__Mode
                        </div>
                        <div className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-widest text-white/40 pointer-events-none">
                            encrypted_signal
                        </div>
                    </button>
                ) : (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title="Trailer"
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                    />
                )}
            </div>
            {/* Footer Data */}
            <div className="flex justify-between items-center px-4 py-2 bg-secondary/5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ID: {videoId}</span>
                <span className={`font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 ${isPlaying ? "text-primary" : "text-muted-foreground"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                    {isPlaying ? "Live_Feed" : "Standby"}
                </span>
            </div>
        </div>
    )
}
