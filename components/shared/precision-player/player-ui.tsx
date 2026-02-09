import { cn } from "@/lib/utils"
import { TopBar } from "./top-bar"
import { BottomBar } from "./bottom-bar"
import { PauseMask } from "./pause-mask"
import { usePrecisionPlayerState, usePrecisionPlayerHandlers, usePrecisionPlayerRefs } from "./context"

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
    } = state

    const { playerElementRef } = refs
    const { handleMouseMove, handlePlayPause, onSetHasStarted } = handlers

    const safeVideoId = videoId ?? ""

    if (isMobile) {
        return (
            <div className="relative w-full aspect-video border border-white/5 bg-black/80 flex flex-col items-center justify-center p-6 text-center shadow-2xl index-cut-tr overflow-hidden">
                <style jsx global>{`
                    .ytp-chrome-top, .ytp-chrome-bottom { display: none !important; }
                `}</style>
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]" />
                </div>
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-4 max-w-xs animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 border border-primary/20 rotate-45 flex items-center justify-center bg-primary/5">
                        <div className="w-8 h-8 flex items-center justify-center -rotate-45">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-primary/80 font-bold">
                            Mobile_Terminal_Offline
                        </h3>
                        <p className="text-[10px] uppercase tracking-widest text-primary/40 leading-relaxed">
                            Precision uplink requires desktop interface.
                            <br />
                            Mobile protocol in development.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className="group relative border border-white/5 shadow-2xl transition-all duration-300 ease-in-out w-full h-full index-cut-tr overflow-visible"
        >
            <style jsx global>{`
                .ytp-chrome-top, .ytp-chrome-bottom { display: none !important; }
            `}</style>

            {/* Container that maintains aspect-video but allows UI to breathe if needed on mobile */}
            <div className="w-full h-full relative overflow-hidden bg-black aspect-video">
                <div className={cn(
                    "w-full h-full relative overflow-hidden group/video",
                    isMobile ? "contrast-100 brightness-100 saturate-100" : "contrast-[1.12] brightness-[1.025] saturate-[1.475]"
                )}>
                    {/* Main Player Display */}
                    <div
                        className="w-full h-full origin-center relative z-10 pointer-events-auto"
                        onClick={() => !hasStarted && onSetHasStarted(true)}
                        onKeyUp={(e) => (e.key === "Enter" || e.key === " ") && !hasStarted && onSetHasStarted(true)}
                        tabIndex={0}
                        role="button"
                    >
                        <PauseMask />

                        <div className="absolute inset-0 z-20">
                            {!isTerminated && (
                                <div
                                    ref={playerElementRef}
                                    className={cn("w-full h-full pointer-events-none", !safeVideoId && "hidden")}
                                />
                            )}
                        </div>

                        {hasStarted && isPlayerReady && (
                            <div
                                className={cn("absolute inset-0 z-30 cursor-pointer", isMobile && "touch-manipulation")}
                                onClick={handlePlayPause}
                                onKeyUp={(e) => (e.key === "Enter" || e.key === " ") && handlePlayPause()}
                                tabIndex={0}
                                role="button"
                            />
                        )}

                        {!isMobile && (
                            <div className="absolute inset-0 pointer-events-none z-20">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_120%)] mix-blend-multiply opacity-80" />
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-20 bg-[length:100%_2px,3px_100%] opacity-20" />
                            </div>
                        )}
                    </div>

                    {/* Tactical Loading Mask (Uplink) */}
                    {hasStarted && !isTerminated && (
                        <div className={cn(
                            "absolute inset-0 z-[45] bg-black flex flex-col items-center justify-center gap-4 transition-all duration-700 ease-in-out",
                            (isSyncing || youtubeUIWait) ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                        )}>
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <div className="absolute inset-0 border border-primary/20 rotate-45 animate-pulse" />
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                            <div className="flex flex-col items-center gap-1 font-mono">
                                <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-bold animate-pulse">
                                    {isSyncing ? "Syncing_Feed" : "Establishing_Uplink"}
                                </span>
                                <span className="text-[8px] uppercase tracking-widest text-primary/40">
                                    {isSyncing ? "Phase_Shift: Active" : "Encryption_Pass: 01"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* UI overlay controls - Using flex-col and flex-1 to ensure BottomBar has enough space */}
                    <div className={cn(
                        "absolute inset-0 z-50 flex flex-col justify-between transition-all duration-500 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none",
                        controlsVisible && !youtubeUIWait && !isSyncing && isPlayerReady ? "opacity-100 visible" : "opacity-0 invisible"
                    )}>
                        <div className="pointer-events-auto flex-shrink-0">
                            <TopBar />
                        </div>
                        <div className="pointer-events-auto flex-shrink-0 mt-auto">
                            <BottomBar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}