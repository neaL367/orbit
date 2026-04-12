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
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        setHoverPos(x / rect.width)
    }

    const handleMouseLeave = () => setHoverPos(null)

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative group/seek flex items-center cursor-pointer h-10 -mt-2 -mb-2 select-none"
        >
            {/* Background Track Area */}
            <div className="absolute inset-x-0 h-[3px] group-hover/seek:h-[5px] transition-all duration-200 bg-white/20 group-hover/seek:bg-white/30 overflow-visible flex items-center">
                {/* Buffer Layer */}
                <div
                    className="absolute inset-y-0 bg-white/20 transition-all duration-300 left-0"
                    style={{ width: `${bufferProgress * 100}%` }}
                />

                {/* Ghost/Preview Layer */}
                {hoverPos !== null && (
                    <div
                        className="absolute inset-y-0 bg-white/30 pointer-events-none left-0"
                        style={{ width: `${hoverPos * 100}%` }}
                    />
                )}

                {/* Played Progress Layer */}
                <div
                    className="absolute inset-y-0 bg-primary"
                    style={{ width: `${played * 100}%` }}
                />

                {/* Playhead (Thumb) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 scale-0 group-hover/seek:scale-100 transition-transform duration-150 ease-out shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                    style={{ left: `${played * 100}%` }}
                />
            </div>

            {/* Time Tooltip */}
            {hoverPos !== null && (
                <div
                    className="absolute bottom-full mb-3 z-50 pointer-events-none"
                    style={{ left: `${hoverPos * 100}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="bg-black/90 backdrop-blur-md px-2 py-1 border border-white/10 flex flex-col items-center shadow-2xl rounded-sm">
                        <span className="font-mono text-[11px] text-white font-black tracking-tighter tabular-nums leading-none">
                            {formatTime(hoverPos * duration)}
                        </span>
                        {/* Decorative arrow */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black/90" />
                    </div>
                </div>
            )}

            {/* Ghost playhead line */}
            {hoverPos !== null && (
                <div
                    className="absolute top-0 bottom-0 w-px bg-white/40 pointer-events-none z-10"
                    style={{ left: `${hoverPos * 100}%`, transform: 'translateX(-50%)' }}
                />
            )}

            {/* Hidden Interaction Layer */}
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
        </div>
    )
}
