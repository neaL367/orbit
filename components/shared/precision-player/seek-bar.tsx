"use client"

import React, { useState, useRef } from "react"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers } from "./context"

export function SeekBar() {
    const { played, duration, bufferProgress } = usePrecisionPlayerState()
    const {
        handleSeekMouseDown, handleSeekChange, handleSeekMouseUp,
        formatTime
    } = usePrecisionPlayerHandlers()

    const [hoverPos, setHoverPos] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return
        const x = Math.max(0, Math.min(e.clientX - containerRef.current.getBoundingClientRect().left, containerRef.current.getBoundingClientRect().width))
        setHoverPos(x / containerRef.current.getBoundingClientRect().width)
    }

    const handleMouseLeave = () => setHoverPos(null)

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative group/seek flex items-center cursor-pointer h-8 sm:h-6 mb-0.5 sm:mb-1 select-none"
        >
            {/* Background Track Area */}
            <div className="absolute inset-x-0 h-[2px] bg-white/10 group-hover/seek:bg-white/15 transition-colors overflow-visible flex items-center">
                {/* Start/End Markers */}
                <div className="absolute left-0 h-2 w-px bg-white/20 -top-[3px]" />
                <div className="absolute right-0 h-2 w-px bg-white/20 -top-[3px]" />

                {/* Buffer Layer */}
                <div
                    className="absolute inset-y-0 bg-white/10 transition-all duration-300 left-0"
                    style={{ width: `${bufferProgress * 100}%` }}
                />

                {/* Ghost/Preview Layer */}
                {hoverPos !== null && (
                    <div
                        className="absolute inset-y-0 bg-white/5 pointer-events-none left-0"
                        style={{ width: `${hoverPos * 100}%` }}
                    />
                )}

                {/* Played Progress Layer - The Main Beam */}
                <div
                    className="absolute inset-y-0 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    style={{ width: `${played * 100}%` }}
                >
                    {/* Leading Edge Glow */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary/20 blur-md rounded-full translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Ghost Playhead & Time Tooltip */}
            {hoverPos !== null && (
                <div
                    className="absolute h-8 z-30 pointer-events-none flex flex-col items-center justify-end pb-8"
                    style={{ left: `${hoverPos * 100}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="bg-black/80 backdrop-blur-md px-2 py-1 mb-2 border border-primary/20 flex flex-col items-center shadow-xl">
                        <span className="font-mono text-[10px] text-primary font-bold tracking-widest">
                            {formatTime(hoverPos * duration)}
                        </span>
                        {/* Tiny decorative arrow on tooltip */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-primary/20" />
                    </div>
                    {/* Ghost playhead line - Dashed for target prediction feel */}
                    <div className="w-px h-6 border-l border-dashed border-white/40 absolute bottom-[-8px]" />
                </div>
            )}

            {/* Hidden Real Interaction Layer - Expanded Hit Area */}
            <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onMouseDown={handleSeekMouseDown}
                onTouchStart={handleSeekMouseDown}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                onTouchEnd={handleSeekMouseUp}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
            />

            {/* Kinetic Playhead UI (The real position) - Enhanced Technical Look */}
            <div
                className="absolute h-4 w-[2px] bg-primary z-20 pointer-events-none flex flex-col items-center shadow-[0_0_8px_rgba(var(--primary),0.8)]"
                style={{ left: `${played * 100}%` }}
            >
                {/* Top Marker */}
                <div className="absolute -top-[3px] w-1.5 h-1.5 bg-primary rotate-45 border border-black transform transition-transform duration-200 group-hover/seek:scale-150" />
            </div>
        </div>
    )
}
