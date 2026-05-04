import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import { loadYouTubeIframeApi } from "@/lib/youtube/load-iframe-api"
import { ExtendedPlayer, ExtendedPlayerOptions, YTEvent, YTOnStateChangeEvent, YTPlayerState } from "./types"

interface UseYouTubeProps {
    videoId: string | null;
    isMounted: boolean;
    muted: boolean;
    volume: number;
    playbackRate?: number;
    autoPlay?: boolean;
}

const STARTUP_RECOVERY_MS = 1800;
const HARD_RECOVERY_MS = 8000;

/** Inert iframe hits/focus so native chrome does not appear; IFrame API still controls playback. */
function suppressNativeYtChrome(player: ExtendedPlayer | null | undefined) {
    try {
        if (!player || typeof player.getIframe !== "function") return;
        const iframe = player.getIframe();
        if (!iframe) return;
        iframe.setAttribute("tabindex", "-1");
        iframe.style.pointerEvents = "none";
        if (typeof document !== "undefined" && document.activeElement === iframe) {
            iframe.blur();
        }
    } catch {
        /* noop */
    }
}

/** YouTube often injects title/play overlays a frame after transport commands; re-run suppress over the next ~500ms. */
function kickSuppressAfterTransport(getPlayer: () => ExtendedPlayer | null | undefined) {
    const run = () => suppressNativeYtChrome(getPlayer() ?? undefined);
    run();
    queueMicrotask(run);
    if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => {
            run();
            requestAnimationFrame(run);
        });
    }
    if (typeof window !== "undefined") {
        for (const ms of [24, 72, 180, 420] as const) {
            window.setTimeout(run, ms);
        }
    }
}

export function useYouTube({ videoId, isMounted, muted, volume, playbackRate, autoPlay = false }: UseYouTubeProps) {
    const [hasStarted, setHasStarted] = useState(autoPlay);
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffer, setIsBuffer] = useState(false);
    const [isTerminated, setIsTerminated] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [youtubeUIWait, setYoutubeUIWait] = useState(false);
    const [isPlayPending, setIsPlayPending] = useState(Boolean(autoPlay));

    const playerRef = useRef<ExtendedPlayer | null>(null);
    const playerElementRef = useRef<HTMLDivElement>(null);
    /** Inner node passed to `YT.Player` — must not be a React-managed text/child tree. */
    const ytSurfaceRef = useRef<HTMLDivElement | null>(null);
    const progressInterval = useRef<number | null>(null);
    /** Avoid `setPlayed` every rAF tick — that re-renders the whole player context and competes with video decode. */
    const progressUiLastRef = useRef(-1);
    const progressUiAtRef = useRef(0);
    const leaderReadyRef = useRef(false);
    const startupRecoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const restorationTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
    const seekSuppressChainRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearStartupRecoveryTimeout = useCallback(() => {
        if (startupRecoveryTimeoutRef.current) {
            clearTimeout(startupRecoveryTimeoutRef.current);
            startupRecoveryTimeoutRef.current = null;
        }
    }, []);

    const clearRestorationTimeouts = useCallback(() => {
        restorationTimeoutsRef.current.forEach(clearTimeout);
        restorationTimeoutsRef.current = [];
    }, []);

    const syncStateRef = useRef({
        played,
        duration,
        volume,
        muted,
        playbackRate: 1,
        playing,
        isSyncing,
        youtubeUIWait,
        isPlayerReady,
        isPlayPending,
    });

    useEffect(() => {
        syncStateRef.current = {
            played,
            duration,
            volume,
            muted,
            playbackRate: syncStateRef.current.playbackRate,
            playing,
            isSyncing,
            youtubeUIWait,
            isPlayerReady,
            isPlayPending,
        };
    }, [played, duration, volume, muted, playing, isSyncing, youtubeUIWait, isPlayerReady, isPlayPending]);

    useEffect(() => {
        if (typeof playbackRate === "number" && Number.isFinite(playbackRate) && playbackRate > 0) {
            syncStateRef.current.playbackRate = playbackRate
            try {
                playerRef.current?.setPlaybackRate(playbackRate)
            } catch {
                /* noop */
            }
        }
    }, [playbackRate])

    const unlockCustomUI = useCallback(() => {
        setIsPlayerReady(true);
        setIsSyncing(false);
        setYoutubeUIWait(false);
    }, []);

    /** `getDuration()` is often `0` on `onReady` until PLAYING / BUFFERING / CUED — poll state handlers too. */
    const trySetDuration = useCallback((player: ExtendedPlayer | null | undefined) => {
        try {
            if (!player || typeof player.getDuration !== "function") return;
            const d = player.getDuration();
            if (typeof d === "number" && Number.isFinite(d) && d > 0) {
                setDuration((prev) => (prev === d ? prev : d));
            }
        } catch {
            /* torn down or API hiccup */
        }
    }, []);

    const markPlayRequested = useCallback(() => {
        setIsPlayPending(true);
        setIsBuffer(true);
        setIsEnded(false);
    }, []);

    const scheduleStartupRecovery = useCallback(() => {
        clearStartupRecoveryTimeout();
        startupRecoveryTimeoutRef.current = setTimeout(() => {
            const { playing: currentlyPlaying, isPlayPending: pending, isPlayerReady: ready } = syncStateRef.current;
            if (!currentlyPlaying && pending) {
                setIsSyncing(false);
                setYoutubeUIWait(false);
                return;
            }
            if (!currentlyPlaying || !ready) {
                unlockCustomUI();
            }
        }, STARTUP_RECOVERY_MS);
    }, [clearStartupRecoveryTimeout, unlockCustomUI]);

    const startProgressLoop = useCallback(() => {
        if (progressInterval.current) cancelAnimationFrame(progressInterval.current);

        const loop = () => {
            const player = playerRef.current;

            if (!leaderReadyRef.current || !player) {
                progressInterval.current = requestAnimationFrame(loop);
                return;
            }

            try {
                const currentTime = player.getCurrentTime();
                const dur = player.getDuration();

                if (dur > 0) {
                    setDuration((prev) => (prev === dur ? prev : dur));
                    const ratio = Math.min(1, Math.max(0, currentTime / dur));
                    const now =
                        typeof performance !== "undefined" ? performance.now() : Date.now();
                    const last = progressUiLastRef.current;
                    const intervalOk = now - progressUiAtRef.current >= 88;
                    const jumped = last >= 0 && Math.abs(ratio - last) >= 0.012;
                    if (last < 0 || intervalOk || jumped) {
                        progressUiLastRef.current = ratio;
                        progressUiAtRef.current = now;
                        setPlayed(ratio);
                    }
                }
            } catch {
                /* torn down or API hiccup */
            }

            progressInterval.current = requestAnimationFrame(loop);
        };

        progressInterval.current = requestAnimationFrame(loop);
    }, []);

    const onLeaderReady = useCallback(
        (event: YTEvent) => {
            const {
                volume: currentVol,
                muted: currentMuted,
                played: currentPlayed,
            } = syncStateRef.current;

            leaderReadyRef.current = true;
            setIsTerminated(false);
            setIsPlayerReady(true);

            const target = event.target as ExtendedPlayer;
            let dur = 0;
            try {
                dur = typeof target.getDuration === "function" ? target.getDuration() : 0;
            } catch {
                dur = 0;
            }
            if (dur > 0) {
                setDuration(dur);
            } else {
                queueMicrotask(() => trySetDuration(target));
                requestAnimationFrame(() => trySetDuration(target));
                for (const ms of [120, 400, 1200] as const) {
                    restorationTimeoutsRef.current.push(
                        setTimeout(() => trySetDuration(target), ms)
                    );
                }
            }

            const startPoint = currentPlayed * (dur || 0);
            const naturalVolume = Math.pow(currentVol / 100, 2) * 100;

            if (typeof event.target.setVolume === "function") {
                event.target.setVolume(naturalVolume);
            }
            if (currentMuted) {
                if (typeof event.target.mute === "function") event.target.mute();
            } else if (typeof event.target.unMute === "function") {
                event.target.unMute();
            }

            if (typeof event.target.setPlaybackQuality === "function") {
                event.target.setPlaybackQuality("highres");
            }

            try {
                const rate = syncStateRef.current.playbackRate
                if (rate && typeof event.target.setPlaybackRate === "function") {
                    event.target.setPlaybackRate(rate)
                }
            } catch {
                /* noop */
            }

            if (startPoint > 0 && typeof event.target.seekTo === "function") {
                event.target.seekTo(startPoint, true);
            }

            if (hasStarted || autoPlay) {
                markPlayRequested();
                setIsSyncing(true);
                setYoutubeUIWait(true);
                if (typeof event.target.playVideo === "function") {
                    event.target.playVideo();
                }
                scheduleStartupRecovery();
            } else {
                setIsBuffer(false);
                unlockCustomUI();
            }

            suppressNativeYtChrome(target);
            startProgressLoop();
        },
        [
            autoPlay,
            hasStarted,
            markPlayRequested,
            scheduleStartupRecovery,
            startProgressLoop,
            trySetDuration,
            unlockCustomUI,
        ]
    );

    const onPlayerStateChange = useCallback(
        (event: YTOnStateChangeEvent) => {
            const state = event.data as number;

            switch (state) {
                case YTPlayerState.PLAYING: {
                    clearStartupRecoveryTimeout();
                    clearRestorationTimeouts();

                    setPlaying(true);
                    setIsPlayPending(false);
                    setIsBuffer(false);
                    setIsTerminated(false);
                    setIsEnded(false);
                    unlockCustomUI();
                    trySetDuration(event.target as ExtendedPlayer);
                    suppressNativeYtChrome(event.target as ExtendedPlayer);

                    const enforce = () => {
                        const activePlayer = playerRef.current;
                        if (!activePlayer) return;

                        try {
                            const { volume: v, muted: m } = syncStateRef.current;
                            const naturalV = Math.pow(v / 100, 2) * 100;
                            if (typeof activePlayer.setVolume === "function") activePlayer.setVolume(naturalV);
                            if (m) activePlayer.mute();
                            else activePlayer.unMute();
                            if (typeof activePlayer.setPlaybackQuality === "function") {
                                activePlayer.setPlaybackQuality("highres");
                            }
                            suppressNativeYtChrome(activePlayer);
                        } catch { }
                    };

                    enforce();
                    [100, 300, 800, 1500].forEach((delay) =>
                        restorationTimeoutsRef.current.push(setTimeout(enforce, delay))
                    );
                    break;
                }

                case YTPlayerState.PAUSED:
                    clearStartupRecoveryTimeout();
                    clearRestorationTimeouts();

                    setPlaying(false);
                    setIsPlayPending(false);
                    setIsBuffer(false);
                    setIsEnded(false);
                    unlockCustomUI();
                    trySetDuration(event.target as ExtendedPlayer);
                    suppressNativeYtChrome(event.target as ExtendedPlayer);
                    break;

                case YTPlayerState.BUFFERING:
                    setIsBuffer(true);
                    setIsEnded(false);
                    setIsPlayerReady(true);
                    trySetDuration(event.target as ExtendedPlayer);
                    suppressNativeYtChrome(event.target as ExtendedPlayer);
                    break;

                case YTPlayerState.CUED:
                case YTPlayerState.UNSTARTED:
                    trySetDuration(event.target as ExtendedPlayer);
                    suppressNativeYtChrome(event.target as ExtendedPlayer);
                    clearStartupRecoveryTimeout();
                    setPlaying(false);
                    setIsEnded(false);

                    if (syncStateRef.current.isPlayPending) {
                        setIsBuffer(true);
                        setIsSyncing(true);
                        setYoutubeUIWait(true);
                    } else {
                        setIsBuffer(false);
                        unlockCustomUI();
                    }
                    break;

                case YTPlayerState.ENDED:
                    clearStartupRecoveryTimeout();
                    clearRestorationTimeouts();

                    setPlaying(false);
                    setIsPlayPending(false);
                    setIsBuffer(false);
                    setIsEnded(true);
                    setPlayed(1);
                    unlockCustomUI();
                    suppressNativeYtChrome(event.target as ExtendedPlayer);
                    break;
            }
        },
        [clearRestorationTimeouts, clearStartupRecoveryTimeout, trySetDuration, unlockCustomUI]
    );

    useEffect(() => {
        if (playing) startProgressLoop();
        else if (progressInterval.current) cancelAnimationFrame(progressInterval.current);
    }, [playing, startProgressLoop]);

    useLayoutEffect(() => {
        if (!hasStarted || !videoId || !isMounted) {
            return
        }

        markPlayRequested();
        setIsPlayerReady(false);
        setIsSyncing(true);
        setYoutubeUIWait(true);
        setIsEnded(false);
        setIsTerminated(false);
        setPlaying(false);

        leaderReadyRef.current = false;

        clearStartupRecoveryTimeout();
        clearRestorationTimeouts();
        restorationTimeoutsRef.current.push(
            setTimeout(() => {
                const { isSyncing: s, youtubeUIWait: w, isPlayPending: p } = syncStateRef.current;
                if (s || w || p) {
                    setIsPlayPending(false);
                    setIsBuffer(false);
                    unlockCustomUI();
                }
            }, HARD_RECOVERY_MS)
        );

        let isEffectMounted = true

        const createPlayer = () => {
            if (!isEffectMounted || playerRef.current || !playerElementRef.current) {
                return
            }
            const host = playerElementRef.current
            host.querySelectorAll("[data-precision-yt-root]").forEach((el) => el.remove())

            const surface = document.createElement("div")
            surface.setAttribute("data-precision-yt-root", "")
            surface.style.cssText = "position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%"
            host.appendChild(surface)
            ytSurfaceRef.current = surface

            const cleanVideoId = (videoId || "").trim()
            if (!cleanVideoId || cleanVideoId.length < 5) {
                surface.remove()
                ytSurfaceRef.current = null
                return
            }

            const { muted: m, volume: v } = syncStateRef.current
            const initialVolume = Math.pow(v / 100, 2) * 100

            try {
                playerRef.current = new window.YT.Player(surface, {
                    videoId: cleanVideoId,
                    host: "https://www.youtube-nocookie.com",
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        /* Always 1: keeps YouTube from handling keys and surfacing native overlays on Tab. */
                        disablekb: 1,
                        enablejsapi: 1,
                        fs: 0,
                        iv_load_policy: 3,
                        playsinline: 1,
                        mute: m ? 1 : 0,
                        rel: 0,
                        modestbranding: 1,
                        showinfo: 0 as unknown as 0 | 1,
                        origin: window.location.origin,
                        widget_referrer: window.location.href,
                        cc_load_policy: 0,
                        hl: "en",
                    },
                    events: {
                        onReady: (e: YTEvent) => {
                            if (typeof e.target.setVolume === "function") e.target.setVolume(initialVolume);
                            onLeaderReady(e);
                        },
                        onStateChange: onPlayerStateChange,
                        onError: () => {
                            if (playerRef.current) {
                                try {
                                    playerRef.current.destroy()
                                } catch { /* noop */ }
                                playerRef.current = null
                            }
                            ytSurfaceRef.current?.remove()
                            ytSurfaceRef.current = null
                            setIsTerminated(true);
                            setIsPlayPending(false);
                            setIsBuffer(false);
                            unlockCustomUI();
                        },
                    },
                } as unknown as ExtendedPlayerOptions);
            } catch {
                surface.remove()
                ytSurfaceRef.current = null
                setIsTerminated(true);
                setIsPlayPending(false);
                setIsBuffer(false);
                unlockCustomUI();
            }
        }

        void loadYouTubeIframeApi()
            .then(() => {
                if (!isEffectMounted) return
                createPlayer()
            })
            .catch(() => {
                if (!isEffectMounted) return
                setIsTerminated(true)
                setIsPlayPending(false)
                setIsBuffer(false)
                unlockCustomUI()
            })

        return () => {
            isEffectMounted = false
            leaderReadyRef.current = false
            if (seekSuppressChainRef.current) {
                clearTimeout(seekSuppressChainRef.current)
                seekSuppressChainRef.current = null
            }

            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch { }
                playerRef.current = null;
            }

            ytSurfaceRef.current?.remove();
            ytSurfaceRef.current = null;

            clearStartupRecoveryTimeout();
            clearRestorationTimeouts();

            if (progressInterval.current) cancelAnimationFrame(progressInterval.current);
            progressInterval.current = null;
            setIsPlayerReady(false);
        };
    }, [
        hasStarted,
        videoId,
        isMounted,
        onLeaderReady,
        onPlayerStateChange,
        unlockCustomUI,
        clearStartupRecoveryTimeout,
        clearRestorationTimeouts,
        markPlayRequested,
    ]);

    useEffect(() => {
        const player = playerRef.current;
        if (!player || !isPlayerReady) return;

        try {
            if (muted) {
                player.mute();
            } else {
                player.unMute();
                const naturalVolume = Math.pow(volume / 100, 2) * 100;
                player.setVolume(naturalVolume);
            }
        } catch {
            /* noop */
        }
    }, [muted, volume, isPlayerReady]);

    useEffect(() => {
        if (!isPlayerReady) return;
        suppressNativeYtChrome(playerRef.current ?? undefined);
    }, [isPlayerReady]);

    const handlePlayPause = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;

        if (playing) {
            setIsPlayPending(false);
            setIsBuffer(false);
            suppressNativeYtChrome(player);
            player.pauseVideo();
            kickSuppressAfterTransport(() => playerRef.current);
        } else {
            const { isPlayerReady: ready } = syncStateRef.current;
            // Resume after pause: do not flip `youtubeUIWait` / `isSyncing` — that hides
            // our chrome and flashes the iframe's native overlay while the mask animates.
            if (ready) {
                setIsEnded(false);
                setIsBuffer(true);
                suppressNativeYtChrome(player);
                player.playVideo();
                kickSuppressAfterTransport(() => playerRef.current);
            } else {
                markPlayRequested();
                setIsSyncing(true);
                setYoutubeUIWait(true);
                scheduleStartupRecovery();
                suppressNativeYtChrome(player);
                player.playVideo();
                kickSuppressAfterTransport(() => playerRef.current);
            }
        }
    }, [playing, markPlayRequested, scheduleStartupRecovery]);  

    const seekTo = useCallback((time: number) => {
        const player = playerRef.current;
        if (!player || typeof player.seekTo !== "function") return;

        suppressNativeYtChrome(player);
        player.seekTo(time, true);
        suppressNativeYtChrome(player);

        if (seekSuppressChainRef.current) {
            clearTimeout(seekSuppressChainRef.current);
            seekSuppressChainRef.current = null;
        }
        seekSuppressChainRef.current = setTimeout(() => {
            seekSuppressChainRef.current = null;
            const run = () => suppressNativeYtChrome(playerRef.current ?? undefined);
            run();
            queueMicrotask(run);
            if (typeof requestAnimationFrame !== "undefined") {
                requestAnimationFrame(() => requestAnimationFrame(run));
            }
            if (typeof window !== "undefined") {
                window.setTimeout(run, 90);
                window.setTimeout(run, 280);
            }
        }, 35);
    }, []);

    const setMute = useCallback((val: boolean) => {
        if (val) playerRef.current?.mute();
        else playerRef.current?.unMute();
    }, []);

    const setPlayerVolume = useCallback((val: number) => {
        const naturalVolume = Math.pow(val / 100, 2) * 100;
        playerRef.current?.setVolume(naturalVolume);
    }, []);

    const restart = useCallback(() => {
        const player = playerRef.current;
        if (!player || !videoId) return;

        setPlayed(0);
        setPlaying(false);
        markPlayRequested();
        setHasStarted(true);
        setIsSyncing(true);
        setYoutubeUIWait(true);
        setIsPlayerReady(false);

        scheduleStartupRecovery();

        player.loadVideoById({
            videoId,
            startSeconds: 0,
            suggestedQuality: "highres",
        } as YT.VideoByIdSettings);
    }, [videoId, scheduleStartupRecovery, markPlayRequested]);

    const onSetHasStarted = useCallback((val: boolean) => {
        setHasStarted(val);
        if (val) {
            markPlayRequested();
            setPlaying(false);
            setIsPlayerReady(false);
            setIsSyncing(true);
            setYoutubeUIWait(true);
        }
    }, [markPlayRequested]);

    const getVideoData = useCallback(() => {
        const p = playerRef.current;
        if (p && typeof p.getVideoData === "function") {
            return p.getVideoData();
        }
        return null;
    }, []);

    const getAvailablePlaybackRates = useCallback(() => {
        if (playerRef.current && typeof playerRef.current.getAvailablePlaybackRates === "function") {
            return playerRef.current.getAvailablePlaybackRates();
        }
        return [1];
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
        if (playerRef.current && typeof playerRef.current.setPlaybackRate === "function") {
            playerRef.current.setPlaybackRate(rate);
        }
    }, []);

    const getPlaybackRate = useCallback(() => {
        if (playerRef.current && typeof playerRef.current.getPlaybackRate === "function") {
            return playerRef.current.getPlaybackRate();
        }
        return 1;
    }, []);

    return {
        hasStarted,
        setHasStarted: onSetHasStarted,
        playing,
        played,
        setPlayed,
        duration,
        setDuration,
        isBuffer,
        isPlayPending,
        isTerminated,
        isPlayerReady,
        isSyncing,
        isEnded,
        youtubeUIWait,
        playerElementRef,
        handlePlayPause,
        seekTo,
        setMute,
        setPlayerVolume,
        restart,
        getVideoData,
        getAvailablePlaybackRates,
        setPlaybackRate,
        getPlaybackRate,
        handleSeekMouseDown: () => {
            if (progressInterval.current) cancelAnimationFrame(progressInterval.current);
        },
        handleSeekMouseUp: () => {
            startProgressLoop();
        },
    };
}
