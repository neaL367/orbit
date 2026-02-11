import { memo } from "react"
import { cn } from "@/lib/utils"
import { TopBar } from "./top-bar"
import { BottomBar } from "./bottom-bar"
import { PauseMask } from "./pause-mask"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers, usePrecisionPlayerRefs } from "./context"

const VideoLayer = memo(({ isTerminated, safeVideoId, isFullscreen, playerElementRef }: any) => (
    <div className="supersampled-container">
        {!isTerminated && (
            <div
                ref={playerElementRef}
                className={cn(
                    "supersampled-frame pointer-events-none",
                    !safeVideoId && "hidden",
                    isFullscreen ? "max-h-screen" : ""
                )}
            />
        )}
    </div>
));

VideoLayer.displayName = "VideoLayer";

export function PlayerUI() {
    const state = usePrecisionPlayerState()
    const handlers = usePrecisionPlayerHandlers()
    const refs = usePrecisionPlayerRefs()

    const {
        isMobile,
        hasStarted,
        isPlayerReady,
        isTerminated,
        videoId,
        controlsVisible,
        youtubeUIWait,
        isSyncing,
        isFullscreen,
    } = state

    const { playerElementRef, containerRef } = refs
    const { handleMouseMove, handlePlayPause, onSetHasStarted } = handlers

    const safeVideoId = videoId ?? ""

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMouseMove}
            className={cn(
                "group relative transition-all duration-300 ease-in-out w-full border-white/5",
                isFullscreen
                    ? "fixed !inset-0 !m-0 !p-0 z-[99999] bg-black h-screen w-screen overflow-hidden is-fullscreen"
                    : "h-auto border shadow-2xl index-cut-tr aspect-video overflow-hidden"
            )}
        >
            <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
                <filter id="precision-sharpen" colorInterpolationFilters="sRGB">
                    {/* 1. Softened Tactical Sharpening (Prevents Halos) */}
                    <feConvolveMatrix
                        order="3"
                        preserveAlpha="true"
                        kernelMatrix="-0.1 -0.1 -0.1 -0.1 1.8 -0.1 -0.1 -0.1 -0.1"
                    />

                    {/* 2. Precision HDR Finish (Punchier Gamma) */}
                    <feComponentTransfer>
                        <feFuncR type="gamma" amplitude="1.08" exponent="1.08" offset="-0.005" />
                        <feFuncG type="gamma" amplitude="1.08" exponent="1.08" offset="-0.005" />
                        <feFuncB type="gamma" amplitude="1.08" exponent="1.08" offset="-0.005" />
                    </feComponentTransfer>

                    {/* 3. Anti-Banding Master Dither (Hides blocky artifacts) */}
                    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" result="noise" />
                    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0" result="dither" />
                    <feComposite in="SourceGraphic" in2="dither" operator="over" />

                    {/* 4. Balanced Vibrancy */}
                    <feColorMatrix type="saturate" values="1.18" />
                </filter>
            </svg>

            <style jsx global>{`
                .ytp-chrome-top, .ytp-chrome-bottom, .ytp-gradient-top, .ytp-gradient-bottom { 
                    display: none !important; 
                }
                
                /* Dynamic Tactical Scaling: 1.4x (Window) | 1.75x (Full) */
                .supersampled-frame {
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    /* Fluid Math: 140% base, 175% on .is-fullscreen */
                    width: 140% !important;
                    height: 140% !important;
                    transform: translate(-50%, -50%) scale(0.71428) translate3d(0,0,0);
                    transform-origin: center center;
                    filter: url(#precision-sharpen);
                    backface-visibility: hidden;
                    transform-style: preserve-3d;
                    will-change: transform, filter;
                    -webkit-font-smoothing: antialiased;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                }

                :global(.is-fullscreen) .supersampled-frame {
                    width: 175% !important;
                    height: 175% !important;
                    transform: translate(-50%, -50%) scale(0.571428) translate3d(0,0,0) !important;
                }
                
                .supersampled-frame iframe {
                    width: 100% !important;
                    height: 100% !important;
                    border: 0;
                }

                .supersampled-container {
                    /* Precision Aspect Lock: Centered 16:9 within parent */
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    height: auto;
                    aspect-ratio: 16 / 9;
                    max-width: 100%;
                    max-height: 100%;
                    overflow: hidden;
                    contain: strict;
                    background: black;
                }
            `}</style>

            <div className={cn(
                "w-full h-full relative overflow-hidden bg-black flex items-center justify-center",
                isFullscreen ? "h-screen" : ""
            )}>
                <div className="w-full h-full relative overflow-hidden group/video">
                    <div
                        className={cn(
                            "relative z-50 pointer-events-auto w-full h-full",
                            isFullscreen && "flex items-center justify-center"
                        )}
                        onClick={() => !hasStarted && onSetHasStarted(true)}
                    >
                        <PauseMask />

                        {/* Video Layer wrapper */}
                        <div className="absolute inset-0 z-20">
                            <VideoLayer
                                isTerminated={isTerminated}
                                safeVideoId={safeVideoId}
                                isFullscreen={isFullscreen}
                                playerElementRef={playerElementRef}
                            />
                        </div>

                        {/* Overlay elements... */}
                        {hasStarted && isPlayerReady && (
                            <div className="absolute inset-0 z-30 cursor-pointer" onClick={handlePlayPause} />
                        )}

                        {/* UI Controls */}
                        <div className={cn(
                            "absolute inset-0 z-[60] flex flex-col justify-between transition-opacity duration-500 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none",
                            controlsVisible && !youtubeUIWait && !isSyncing && isPlayerReady ? "opacity-100" : "opacity-0"
                        )}>
                            <div className="pointer-events-auto"><TopBar /></div>
                            <div className="pointer-events-auto mt-auto"><BottomBar /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}