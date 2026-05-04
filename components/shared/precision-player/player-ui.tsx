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
    <div
        className={cn(
            isMobile ? "w-full h-full bg-black relative overflow-hidden" : "supersampled-container",
            "pointer-events-none"
        )}
    >
        <div
            ref={playerElementRef}
            className={cn(
                isMobile ? "w-full h-full relative z-10 pointer-events-none precision-yt-host" : "supersampled-frame pointer-events-none",
                !safeVideoId && "hidden",
                isFullscreen ? "max-h-screen" : "",
                isTerminated && "hidden"
            )}
            aria-hidden={isTerminated}
        />
    </div>
));

VideoLayer.displayName = "VideoLayer";

const PrecisionFilters = memo(() => (
    <>
        <style jsx global>{`
            .precision-player-root {
                /* Balanced grade: avoids crushing mids and clipping clouds; heavy corner masks looked worse than occasional YT chrome. */
                --ps-hdr-contrast: 1.06;
                --ps-hdr-sat: 1.08;
                --ps-hdr-bright: 0.95;
                --ps-bloom: 0.12;
                --ps-vignette: 0.58;
            }

            /* Scoped: avoids affecting other embeds; iframe-internal chrome is usually not targetable cross-origin. */
            .precision-player-root .ytp-chrome-top,
            .precision-player-root .ytp-chrome-bottom,
            .precision-player-root .ytp-gradient-top,
            .precision-player-root .ytp-gradient-bottom {
                display: none !important;
            }

            /* Cannot reach inside the iframe; block all direct hits so YouTube chrome never opens from hover/tap. */
            .precision-player-root iframe {
                pointer-events: none !important;
            }

            /* Edge-to-edge iframe; no scale/clip (those change effective framing / aspect). Grade only. */
            .precision-player-root .precision-yt-host iframe {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0;
                transform: none !important;
                filter: contrast(var(--ps-hdr-contrast)) brightness(var(--ps-hdr-bright))
                    saturate(var(--ps-hdr-sat));
            }
            .precision-player-root .supersampled-frame {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                transform: none !important;
                transform-origin: center center;
                backface-visibility: hidden;
            }

            .precision-player-root .supersampled-container {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                isolation: isolate;
                background: black;
            }

            /* Per-frame SVG filters + heavy blend stacks were forcing full-GPU readbacks and made playback feel laggy.
               Keep a mild CSS-only grade so the compositor can stay on the fast path. */
            .precision-player-root .supersampled-frame iframe {
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                border: 0;
                transform: none !important;
                filter: contrast(var(--ps-hdr-contrast)) brightness(var(--ps-hdr-bright))
                    saturate(var(--ps-hdr-sat));
            }
            
            /* Ambient bloom: screen blend was blowing out speculars on SDR web video; soft-light + lower weight keeps depth without clipping. */
            .precision-player-root .supersampled-container::before {
                content: '';
                position: absolute;
                inset: -8%;
                pointer-events: none;
                z-index: 12;
                background:
                    radial-gradient(circle at 40% 30%, rgba(255,255,255, calc(var(--ps-bloom) * 0.1)) 0%, transparent 38%),
                    radial-gradient(circle at 70% 55%, rgba(255,255,255, calc(var(--ps-bloom) * 0.07)) 0%, transparent 45%),
                    radial-gradient(circle at 30% 70%, rgba(255,255,255, calc(var(--ps-bloom) * 0.05)) 0%, transparent 48%);
                filter: blur(12px) saturate(1.04);
                mix-blend-mode: soft-light;
                opacity: 0.32;
                transform: translate3d(0, 0, 0);
            }

            .precision-player-root .supersampled-container::after {
                content: '';
                position: absolute;
                inset: 0;
                pointer-events: none;
                background:
                    radial-gradient(circle at center, transparent 38%, rgba(0,0,0, var(--ps-vignette)) 100%),
                    linear-gradient(to bottom, rgba(0,0,0,0.26), transparent 18%, transparent 82%, rgba(0,0,0,0.36));
                opacity: 0.52;
                z-index: 14;
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
        precisionChromeGate,
        youtubeUIWait,
        isSyncing,
        isFullscreen,
        isMobile,
        playing,
    } = state

    const safeVideoId = videoId ?? ""
    const controlsAreVisible =
        controlsVisible && !youtubeUIWait && !isSyncing && isPlayerReady && precisionChromeGate

    /** Edge masks use the same visibility window as PRECISION chrome (auto-hide timing stays in sync). */
    const edgeChromeFadeVisible =
        hasStarted &&
        ((!isPlayerReady || youtubeUIWait || isSyncing || !precisionChromeGate) || controlsAreVisible)

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

    const videoStageClassName = cn(
        "group/video relative z-50 h-full w-full overflow-hidden pointer-events-auto",
        !hasStarted && "cursor-pointer",
        isFullscreen && "flex items-center justify-center"
    )

    const videoStageContent = (
        <>
            <PauseMask />

            <div className={cn("absolute inset-0 overflow-hidden z-20")}>
                <VideoLayer
                    isTerminated={isTerminated}
                    safeVideoId={safeVideoId}
                    isFullscreen={isFullscreen}
                    isMobile={isMobile}
                    playerElementRef={playerElementRef}
                />
            </div>

            {hasStarted && safeVideoId && (
                <>
                    <div
                        aria-hidden
                        className={cn(
                            "absolute inset-x-0 top-0 z-25 h-[min(44%,13rem)] pointer-events-none ease-in-out will-change-[opacity] transition-opacity duration-350",
                            edgeChromeFadeVisible ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.88) 10%, rgba(0,0,0,0.7) 28%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0.14) 78%, transparent 100%)",
                        }}
                    />
                    <div
                        aria-hidden
                        className={cn(
                            "absolute inset-x-0 bottom-0 z-25 h-[min(50%,15rem)] pointer-events-none ease-in-out will-change-[opacity] transition-opacity duration-350",
                            edgeChromeFadeVisible ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                            background:
                                "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.92) 9%, rgba(0,0,0,0.76) 22%, rgba(0,0,0,0.48) 48%, rgba(0,0,0,0.2) 74%, transparent 100%)",
                        }}
                    />
                    <div
                        aria-hidden
                        className={cn(
                            "absolute inset-0 z-25 pointer-events-none ease-in-out will-change-[opacity] transition-opacity duration-350",
                            edgeChromeFadeVisible ? "opacity-100" : "opacity-0"
                        )}
                        style={{
                            background: !playing
                                ? "radial-gradient(ellipse 76% 62% at 50% 46%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 32%, rgba(0,0,0,0.12) 58%, transparent 74%)"
                                : "radial-gradient(ellipse 68% 54% at 50% 48%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.16) 48%, transparent 68%)",
                        }}
                    />
                </>
            )}

            {hasStarted && isPlayerReady && (
                <div
                    aria-hidden
                    className="absolute inset-0 z-30 cursor-default touch-manipulation [-webkit-tap-highlight-color:transparent]"
                    onClick={handlePlayPause}
                />
            )}

            {!isMobile && <VolumeUI />}

            {(
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

    const videoStage = (
        <div
            role={hasStarted ? "group" : "button"}
            tabIndex={hasStarted ? -1 : 0}
            aria-label={hasStarted ? "Video" : "Initialize trailer playback"}
            className={videoStageClassName}
            onClick={hasStarted ? undefined : () => onSetHasStarted(true)}
            onKeyDown={
                hasStarted
                    ? undefined
                    : (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              onSetHasStarted(true)
                          }
                      }
            }
        >
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
                    ? "fixed inset-0 z-99999 m-0 h-dvh w-dvw overflow-hidden bg-black p-0 is-fullscreen"
                    : "aspect-video h-auto overflow-hidden border shadow-2xl"
            )}
            style={{
                transform: isFullscreen || isMobile ? "none" : "translate3d(0,0,0)",
                /* perspective promoted an extra 3D compositing pass over the iframe; not needed for controls */
                backfaceVisibility: isMobile ? "visible" : "hidden",
            }}
        >
            <PrecisionFilters />

            <div className={cn(
                "w-full h-full relative overflow-hidden bg-black flex items-center justify-center",
                isFullscreen ? "h-screen" : ""
            )}>
                {videoStage}
            </div>
        </div>
    );
}
