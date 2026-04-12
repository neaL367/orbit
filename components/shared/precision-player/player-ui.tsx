import { memo } from "react"
import { cn } from "@/lib/utils"
import { TopBar } from "./top-bar"
import { BottomBar } from "./bottom-bar"
import { PauseMask } from "./pause-mask"
import { VolumeUI } from "./volume-ui"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers, usePrecisionPlayerRefs } from "./context"

interface VideoLayerProps {
    isTerminated: boolean;
    safeVideoId: string;
    isFullscreen: boolean;
    isMobile: boolean;
    playerElementRef: React.RefObject<HTMLDivElement | null>;
}

const VideoLayer = memo(({ isTerminated, safeVideoId, isFullscreen, isMobile, playerElementRef }: VideoLayerProps) => (
    <div className={cn(isMobile ? "w-full h-full bg-black relative" : "supersampled-container")}>
        {!isTerminated && (
            <div
                ref={playerElementRef}
                className={cn(
                    isMobile ? "w-full h-full relative z-10" : "supersampled-frame pointer-events-none",
                    !safeVideoId && "hidden",
                    isFullscreen ? "max-h-screen" : ""
                )}
            />
        )}
        {!isMobile && <div className="precision-dither-overlay" />}
    </div>
));

VideoLayer.displayName = "VideoLayer";

const PrecisionFilters = memo(() => (
    <>
        <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
            <filter id="precision-ultrasharpen" colorInterpolationFilters="sRGB">
                <feConvolveMatrix
                    order="3"
                    kernelMatrix="-0.3 -0.3 -0.3 -0.3 3.4 -0.3 -0.3 -0.3 -0.3"
                    preserveAlpha="true"
                    result="sharpened"
                />
                <feComponentTransfer in="sharpened">
                    <feFuncR type="gamma" amplitude="1.05" exponent="1.1" offset="-0.02" />
                    <feFuncG type="gamma" amplitude="1.05" exponent="1.1" offset="-0.02" />
                    <feFuncB type="gamma" amplitude="1.05" exponent="1.1" offset="-0.02" />
                </feComponentTransfer>
            </filter>
            <filter id="imax-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" result="noise" />
                <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.1 0" />
            </filter>
        </svg>

        <style jsx global>{`
            .precision-player-root {
                --ps-scale-window: 1.5;
                --ps-scale-full: 2.25;
            }

            /* Scoped: avoids affecting other embeds; iframe-internal chrome is usually not targetable cross-origin. */
            .precision-player-root .ytp-chrome-top,
            .precision-player-root .ytp-chrome-bottom,
            .precision-player-root .ytp-gradient-top,
            .precision-player-root .ytp-gradient-bottom {
                display: none !important;
            }

            .precision-player-root .supersampled-frame {
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                width: calc(var(--ps-scale-window) * 100%) !important;
                height: calc(var(--ps-scale-window) * 100%) !important;
                transform: translate3d(-50%, -50%, 0) scale(calc(1 / var(--ps-scale-window))) !important;
                transform-origin: center center;
                backface-visibility: hidden;
                will-change: transform;
                contain: strict;
            }

            .precision-player-root .supersampled-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate3d(-50%, -50%, 0);
                width: 100%;
                height: 100%;
                aspect-ratio: 16 / 9;
                overflow: hidden;
                contain: strict;
                isolation: isolate;
                background: black;
            }

            .precision-player-root .supersampled-frame iframe {
                width: 100% !important;
                height: 100% !important;
                border: 0;
                transform: scale(1.08) !important;
                filter: url(#precision-ultrasharpen) contrast(1.04) brightness(1) saturate(1.4);
                image-rendering: -webkit-optimize-contrast;
            }
            
            .precision-player-root .precision-dither-overlay {
                position: absolute;
                inset: -5px;
                z-index: 20;
                pointer-events: none;
                filter: url(#imax-grain);
                mix-blend-mode: overlay;
                opacity: 0.12;
                animation: dither-cycle 0.1s steps(2) infinite;
            }

            @keyframes dither-cycle {
                0% { transform: translate(0,0); }
                50% { transform: translate(1px, 1px); }
                100% { transform: translate(0,0); }
            }

            @media (prefers-reduced-motion: reduce) {
                .precision-player-root .precision-dither-overlay {
                    animation: none !important;
                    opacity: 0.05;
                }
            }

            .precision-player-root .supersampled-container::after {
                content: '';
                position: absolute;
                inset: 0;
                pointer-events: none;
                background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.3) 100%);
                backdrop-filter: brightness(1.02);
                opacity: 0.4;
                z-index: 10;
            }
        `}</style>
    </>
));

PrecisionFilters.displayName = "PrecisionFilters";

export function PlayerUI() {
    const state = usePrecisionPlayerState()
    const handlers = usePrecisionPlayerHandlers()
    const refs = usePrecisionPlayerRefs()

    const {
        hasStarted,
        isPlayerReady,
        isTerminated,
        videoId,
        controlsVisible,
        youtubeUIWait,
        isSyncing,
        isFullscreen,
        isMobile,
    } = state

    const { playerElementRef } = refs
    const {
        handleMouseMove,
        handleMouseLeave,
        handlePlayPause,
        onSetHasStarted,
        onControlsPointerEnter,
        onControlsPointerLeave,
        handleContainerKeyDown,
    } = handlers

    const safeVideoId = videoId ?? ""
    const controlsAreVisible = controlsVisible && !youtubeUIWait && !isSyncing && isPlayerReady

    const videoStageClassName = cn(
        "group/video relative z-50 h-full w-full overflow-hidden pointer-events-auto",
        !hasStarted && "cursor-pointer",
        isFullscreen && "flex items-center justify-center"
    )

    const videoStageContent = (
        <>
            {!isMobile && <PauseMask />}

            <div className={cn("absolute inset-0 overflow-hidden", isMobile ? "z-50" : "z-20")}>
                <VideoLayer
                    isTerminated={isTerminated}
                    safeVideoId={safeVideoId}
                    isFullscreen={isFullscreen}
                    isMobile={isMobile}
                    playerElementRef={playerElementRef}
                />
            </div>

            {!isMobile && hasStarted && isPlayerReady && (
                <div
                    className="absolute inset-0 z-30 cursor-default"
                    onClick={handlePlayPause}
                    onKeyDown={(e) => {
                        if (e.key === " " || e.key === "k") {
                            e.preventDefault()
                            handlePlayPause()
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Toggle Play/Pause"
                />
            )}

            {!isMobile && <VolumeUI />}

            {!isMobile && (
                <div
                    className={cn(
                        "absolute inset-0 z-60 flex flex-col justify-between transition-opacity duration-350 bg-linear-to-b from-black/60 via-transparent to-black/60 pointer-events-none",
                        controlsAreVisible ? "opacity-100" : "opacity-0"
                    )}
                    style={{
                        willChange: "opacity",
                        transform: "translate3d(0,0,0)",
                    }}
                >
                    <div
                        className={cn(
                            "mt-0 transition-all duration-350",
                            controlsAreVisible ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-3 opacity-0 pointer-events-none"
                        )}
                        onMouseEnter={onControlsPointerEnter}
                        onMouseLeave={onControlsPointerLeave}
                    >
                        <TopBar />
                    </div>

                    <div
                        className={cn(
                            "mt-auto transition-all duration-350",
                            controlsAreVisible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-4 opacity-0 pointer-events-none"
                        )}
                        onMouseEnter={onControlsPointerEnter}
                        onMouseLeave={onControlsPointerLeave}
                    >
                        <BottomBar />
                    </div>
                </div>
            )}
        </>
    )

    const videoStage = !hasStarted ? (
        <div
            role="button"
            tabIndex={0}
            aria-label="Initialize trailer playback"
            className={videoStageClassName}
            onClick={() => onSetHasStarted(true)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSetHasStarted(true)
                }
            }}
        >
            {videoStageContent}
        </div>
    ) : (
        <div role="group" aria-label="Video" tabIndex={-1} className={videoStageClassName}>
            {videoStageContent}
        </div>
    )

    return (
        <div
            role="group"
            aria-label="Trailer playback"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseMove}
            onKeyDown={hasStarted ? handleContainerKeyDown : undefined}
            tabIndex={hasStarted ? 0 : -1}
            className={cn(
                "precision-player-root group relative w-full border-white/5 outline-none transition-[border-color,opacity] duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isFullscreen
                    ? "fixed inset-0 z-[99999] m-0 h-dvh w-dvw overflow-hidden bg-black p-0 is-fullscreen"
                    : "aspect-video h-auto overflow-hidden border shadow-2xl"
            )}
            style={{
                transform: isFullscreen || isMobile ? 'none' : 'translate3d(0,0,0)',
                perspective: isMobile ? 'none' : '1000px',
                backfaceVisibility: isMobile ? 'visible' : 'hidden'
            }}
        >
            {!isMobile && <PrecisionFilters />}

            <div className={cn(
                "w-full h-full relative overflow-hidden bg-black flex items-center justify-center",
                isFullscreen ? "h-screen" : ""
            )}>
                {videoStage}
            </div>
        </div>
    );
}
