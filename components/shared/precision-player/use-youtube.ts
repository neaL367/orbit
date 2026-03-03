import { useState, useEffect, useRef, useCallback } from "react";
import { ExtendedPlayer, YTEvent, YTOnStateChangeEvent, YTPlayerState, YTOnErrorEvent } from "./types";

interface UseYouTubeProps {
    videoId: string | null;
    isMounted: boolean;
    muted: boolean;
    volume: number;
    isMobile?: boolean;
    autoPlay?: boolean;
}

const STARTUP_RECOVERY_MS = 1800;
const HARD_RECOVERY_MS = 8000;

export function useYouTube({ videoId, isMounted, muted, volume, isMobile = false, autoPlay = false }: UseYouTubeProps) {
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
    const progressInterval = useRef<number | null>(null);
    const leaderReadyRef = useRef(false);
    const startupRecoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const restorationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

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
            playing,
            isSyncing,
            youtubeUIWait,
            isPlayerReady,
            isPlayPending,
        };
    }, [played, duration, volume, muted, playing, isSyncing, youtubeUIWait, isPlayerReady, isPlayPending]);

    const unlockCustomUI = useCallback(() => {
        setIsPlayerReady(true);
        setIsSyncing(false);
        setYoutubeUIWait(false);
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
                    setPlayed(currentTime / dur);
                }
            } catch (err) {
                console.error("[PrecisionPlayer] Progress Loop Error:", err);
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

            const dur = event.target.getDuration();
            if (dur) setDuration(dur);

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

            startProgressLoop();
        },
        [autoPlay, hasStarted, markPlayRequested, scheduleStartupRecovery, startProgressLoop, unlockCustomUI]
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
                    break;

                case YTPlayerState.BUFFERING:
                    setIsBuffer(true);
                    setIsEnded(false);
                    setIsPlayerReady(true);
                    break;

                case YTPlayerState.CUED:
                case YTPlayerState.UNSTARTED:
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
                    break;
            }
        },
        [clearRestorationTimeouts, clearStartupRecoveryTimeout, unlockCustomUI]
    );

    useEffect(() => {
        if (playing) startProgressLoop();
        else if (progressInterval.current) cancelAnimationFrame(progressInterval.current);
    }, [playing, startProgressLoop]);

    useEffect(() => {
        if (!hasStarted || !videoId || !isMounted) return;

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

        let isEffectMounted = true;
        let checkInterval: NodeJS.Timeout | null = null;

        const createPlayer = () => {
            if (!isEffectMounted || playerRef.current || !playerElementRef.current) return;

            const cleanVideoId = (videoId || "").trim();
            if (!cleanVideoId || cleanVideoId.length < 5) return;

            const { muted: m, volume: v } = syncStateRef.current;
            const initialVolume = Math.pow(v / 100, 2) * 100;

            try {
                playerRef.current = new window.YT.Player(playerElementRef.current, {
                    videoId: cleanVideoId,
                    playerVars: {
                        autoplay: 1,
                        controls: isMobile ? 1 : 0,
                        disablekb: isMobile ? 0 : 1,
                        enablejsapi: 1,
                        fs: 0,
                        iv_load_policy: 3,
                        playsinline: 1,
                        mute: m ? 1 : 0,
                        vq: "hd2160",
                        suggestedQuality: "hd2160",
                        rel: 0,
                        modestbranding: 1,
                        origin: window.location.origin,
                        cc_load_policy: 1,
                        hl: "en",
                    },
                    events: {
                        onReady: (e: YTEvent) => {
                            if (typeof e.target.setVolume === "function") e.target.setVolume(initialVolume);
                            onLeaderReady(e);
                        },
                        onStateChange: onPlayerStateChange,
                        onError: (e: YTOnErrorEvent) => {
                            console.error("[PrecisionPlayer] Error:", e.data);
                            setIsTerminated(true);
                            setIsPlayPending(false);
                            setIsBuffer(false);
                            unlockCustomUI();
                        },
                    },
                });
            } catch (err) {
                console.error("[PrecisionPlayer] Creation failed:", err);
                setIsTerminated(true);
                setIsPlayPending(false);
                setIsBuffer(false);
                unlockCustomUI();
            }
        };

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            checkInterval = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    if (checkInterval) clearInterval(checkInterval);
                    createPlayer();
                }
            }, 100);
        }

        return () => {
            isEffectMounted = false;
            leaderReadyRef.current = false;

            if (checkInterval) clearInterval(checkInterval);

            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch { }
                playerRef.current = null;
            }

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
        isMobile,
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
        } catch (e) {
            console.warn("[PrecisionPlayer] Audio sync failed:", e);
        }
    }, [muted, volume, isPlayerReady]);

    const handlePlayPause = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;

        if (playing) {
            setIsPlayPending(false);
            setIsBuffer(false);
            player.pauseVideo();
        } else {
            markPlayRequested();
            setIsSyncing(true);
            setYoutubeUIWait(true);
            scheduleStartupRecovery();
            player.playVideo();
        }
    }, [playing, markPlayRequested, scheduleStartupRecovery]);

    const seekTo = useCallback((time: number) => {
        if (playerRef.current && typeof playerRef.current.seekTo === "function") {
            playerRef.current.seekTo(time, true);
        }
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
        if (playerRef.current && typeof (playerRef.current as any).getVideoData === "function") {
            return (playerRef.current as any).getVideoData();
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
