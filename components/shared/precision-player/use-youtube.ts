import { useState, useEffect, useRef, useCallback } from "react";
import { ExtendedPlayer, YTEvent, YTOnStateChangeEvent, YTPlayerState, YTOnErrorEvent } from "./types";

interface UseYouTubeProps {
    videoId: string | null;
    isMounted: boolean;
    muted: boolean;
    volume: number;
    isMobile?: boolean; // Added isMobile
    autoPlay?: boolean;
}

export function useYouTube({ videoId, isMounted, muted, volume, isMobile = false, autoPlay = false }: UseYouTubeProps) {
    const [hasStarted, setHasStarted] = useState(autoPlay);
    const [playing, setPlaying] = useState(autoPlay);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffer, setIsBuffer] = useState(false);
    const [isTerminated, setIsTerminated] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [youtubeUIWait, setYoutubeUIWait] = useState(false);

    const playerRef = useRef<ExtendedPlayer | null>(null);
    const ambientPlayerRef = useRef<ExtendedPlayer | null>(null);
    const playerElementRef = useRef<HTMLDivElement>(null);
    const ambientElementRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<number | null>(null);
    const leaderReadyRef = useRef(false);
    const ambientReadyRef = useRef(false);
    const uiWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const restorationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

    const clearRestorationTimeouts = useCallback(() => {
        restorationTimeoutsRef.current.forEach(clearTimeout);
        restorationTimeoutsRef.current = [];
    }, []);

    // Track state in ref for safe access in callbacks
    const syncStateRef = useRef({ played, duration, volume, muted, playing, isSyncing, youtubeUIWait });
    useEffect(() => {
        syncStateRef.current = { played, duration, volume, muted, playing, isSyncing, youtubeUIWait };
    }, [played, duration, volume, muted, playing, isSyncing, youtubeUIWait]);

    const startProgressLoop = useCallback(() => {
        if (progressInterval.current) cancelAnimationFrame(progressInterval.current);

        let lastAmbientSync = 0;

        const loop = () => {
            const player = playerRef.current;
            const ambient = ambientPlayerRef.current;

            if (!leaderReadyRef.current || !player) {
                progressInterval.current = requestAnimationFrame(loop);
                return;
            }

            try {
                const currentTime = player.getCurrentTime();
                const dur = player.getDuration();

                if (dur > 0) {
                    setDuration(prev => prev === dur ? prev : dur);
                    setPlayed(currentTime / dur);
                }

                // Sustainable Ambient Sync (Refined for sync-stability and flicker-prevention)
                const now = Date.now();
                if (ambient && ambientReadyRef.current && (now - lastAmbientSync > 1000)) {
                    lastAmbientSync = now;

                    const ambientTime = ambient.getCurrentTime();
                    const drift = currentTime - ambientTime;

                    // Relaxed drift threshold (1.5s) - Prevents sync-jitter while maintaining general alignment
                    if (Math.abs(drift) > 1.5) {
                        ambient.seekTo(currentTime, true);
                    }

                    // Ensure State Parity (Leader/Slave state matching)
                    const leaderState = player.getPlayerState() as number;
                    const ambientState = ambient.getPlayerState() as number;

                    if (leaderState === (YTPlayerState.PLAYING as number) && ambientState !== (YTPlayerState.PLAYING as number)) {
                        ambient.playVideo();
                    } else if (leaderState === (YTPlayerState.PAUSED as number) && ambientState !== (YTPlayerState.PAUSED as number)) {
                        ambient.pauseVideo();
                    }

                    // Priority: Playback Rate Parity (Keeps them naturally aligned)
                    const leaderRate = player.getPlaybackRate();
                    const ambientRate = ambient.getPlaybackRate();
                    if (leaderRate !== ambientRate) {
                        ambient.setPlaybackRate(leaderRate);
                    }
                }
            } catch { }
            progressInterval.current = requestAnimationFrame(loop);
        };

        progressInterval.current = requestAnimationFrame(loop);
    }, []);

    const onLeaderReady = useCallback((event: YTEvent) => {
        const { volume: currentVol, muted: currentMuted, played: currentPlayed, playing: currentPlaying } = syncStateRef.current;
        console.log("[PrecisionPlayer] Leader Ready", { currentVol, currentMuted });

        leaderReadyRef.current = true;

        const dur = event.target.getDuration();
        if (dur) setDuration(dur);

        const startPoint = currentPlayed * (dur || 0);

        if (typeof event.target.setVolume === 'function') {
            const naturalVolume = Math.pow(currentVol / 100, 2) * 100;
            event.target.setVolume(naturalVolume);
        }
        if (currentMuted) {
            if (typeof event.target.mute === 'function') event.target.mute();
        } else {
            if (typeof event.target.unMute === 'function') event.target.unMute();
        }

        if (currentPlaying) {
            setYoutubeUIWait(true);
            setIsSyncing(true);
            if (typeof event.target.seekTo === 'function') event.target.seekTo(startPoint, true);

            // High Fidelity Quality Lock
            if (typeof event.target.setPlaybackQuality === 'function') {
                event.target.setPlaybackQuality('highres');
            }

            if (typeof event.target.playVideo === 'function') event.target.playVideo();
        } else {
            // Even if not playing, prime the quality
            if (typeof event.target.setPlaybackQuality === 'function') {
                event.target.setPlaybackQuality('highres');
            }
        }

        if (leaderReadyRef.current) {
            startProgressLoop();
        }
    }, [startProgressLoop]);

    const onAmbientReady = useCallback((event: YTEvent) => {
        console.log("[PrecisionPlayer] Ambient Ready Event");
        ambientReadyRef.current = true;
        try {
            if (typeof event.target.mute === 'function') event.target.mute();
            if (typeof event.target.setVolume === 'function') event.target.setVolume(0);
            if (typeof event.target.setPlaybackQuality === 'function') event.target.setPlaybackQuality("small");
        } catch { }

        const leader = playerRef.current;
        if (leaderReadyRef.current && leader) {
            if (typeof event.target.seekTo === 'function') event.target.seekTo(leader.getCurrentTime(), true);
            startProgressLoop();
        }
    }, [startProgressLoop]);

    const onPlayerStateChange = useCallback((event: YTOnStateChangeEvent) => {
        const ambient = ambientPlayerRef.current;
        const state = event.data as number;
        const { isSyncing: currentSync, youtubeUIWait: currentWait } = syncStateRef.current;

        console.log("[PrecisionPlayer] State Change:", state);

        switch (state) {
            case YTPlayerState.PLAYING:
                setPlaying(true);
                setIsBuffer(false);
                setIsTerminated(false);
                setIsEnded(false);

                // Persistent Content Enforcement (Defeats YouTube's internal 100% reset & Low-Res fallback)
                const enforce = () => {
                    if (event.target && typeof event.target.setVolume === 'function') {
                        const { volume: v, muted: m } = syncStateRef.current;
                        const naturalV = Math.pow(v / 100, 2) * 100;
                        event.target.setVolume(naturalV);
                        if (m) event.target.mute(); else event.target.unMute();
                    }
                    if (event.target && typeof event.target.setPlaybackQuality === 'function') {
                        event.target.setPlaybackQuality('highres');
                    }
                };

                enforce(); // Immediate
                [100, 300, 800, 1500].forEach(delay => setTimeout(enforce, delay));

                if (currentSync || currentWait) {
                    if (uiWaitTimeoutRef.current) {
                        console.log("[PrecisionPlayer] UI wait already in progress...");
                    } else {
                        console.log("[PrecisionPlayer] Starting UI wait timeout...");
                        clearRestorationTimeouts();
                        uiWaitTimeoutRef.current = setTimeout(() => {
                            setYoutubeUIWait(false);
                            setIsPlayerReady(true);

                            setTimeout(() => {
                                setIsSyncing(false);
                                uiWaitTimeoutRef.current = null;

                                if (ambientPlayerRef.current) {
                                    try {
                                        if (typeof ambientPlayerRef.current.playVideo === 'function') ambientPlayerRef.current.playVideo();
                                    } catch { }
                                }
                            }, 300);
                        }, 800);
                    }
                } else {
                    setIsSyncing(false);
                    setYoutubeUIWait(false);
                }

                if (ambient && !currentSync && !currentWait) {
                    try {
                        if (typeof ambient.playVideo === 'function') {
                            const leaderTime = event.target.getCurrentTime();
                            ambient.seekTo(leaderTime, true);
                            ambient.playVideo();
                        }
                    } catch { }
                }
                break;
            case YTPlayerState.PAUSED:
                setPlaying(false);
                setIsBuffer(false);
                setIsEnded(false);
                if (uiWaitTimeoutRef.current) {
                    clearTimeout(uiWaitTimeoutRef.current);
                    uiWaitTimeoutRef.current = null;
                }
                clearRestorationTimeouts();
                setYoutubeUIWait(false);
                setIsSyncing(false);
                if (typeof ambient?.pauseVideo === 'function') ambient.pauseVideo();
                break;
            case YTPlayerState.BUFFERING:
                setIsBuffer(true);
                setIsEnded(false);
                break;
            case YTPlayerState.ENDED:
                setPlaying(false);
                setIsBuffer(false);
                setIsEnded(true);
                if (uiWaitTimeoutRef.current) clearTimeout(uiWaitTimeoutRef.current);
                setYoutubeUIWait(false);
                setIsSyncing(false);
                setPlayed(1);
                if (typeof ambient?.pauseVideo === 'function') ambient.pauseVideo();
                break;
        }
    }, [clearRestorationTimeouts]);

    useEffect(() => {
        if (playing) {
            startProgressLoop();
        } else {
            if (progressInterval.current) cancelAnimationFrame(progressInterval.current);
        }
    }, [playing, startProgressLoop]);

    useEffect(() => {
        console.log("[PrecisionPlayer] Init Effect", { hasStarted, videoId, isMounted });
        if (!hasStarted || !videoId || !isMounted) return;

        if (hasStarted) {
            setIsSyncing(true);
            setYoutubeUIWait(true);

            const fallbackTimeout = setTimeout(() => {
                const { isSyncing: s, youtubeUIWait: w } = syncStateRef.current;
                if (s || w) {
                    console.warn("[PrecisionPlayer] Safety fallback: Clearing stuck sync state.");
                    setIsSyncing(false);
                    setYoutubeUIWait(false);
                }
            }, 8000);
            restorationTimeoutsRef.current.push(fallbackTimeout);
        }
        setIsPlayerReady(false);
        leaderReadyRef.current = false;
        ambientReadyRef.current = false;

        let isEffectMounted = true;

        const createPlayers = () => {
            if (!isEffectMounted || playerRef.current || !playerElementRef.current) return;

            const cleanVideoId = (videoId || "").trim();
            if (!cleanVideoId || cleanVideoId.length < 5) return;

            // Get latest audio state from ref before creating
            const { muted: m, volume: v } = syncStateRef.current;
            const initialVolume = Math.pow(v / 100, 2) * 100;

            try {
                playerRef.current = new window.YT.Player(playerElementRef.current!, {
                    videoId: cleanVideoId,
                    playerVars: {
                        autoplay: 1,
                        controls: isMobile ? 1 : 0,
                        disablekb: isMobile ? 0 : 1,
                        enablejsapi: 1,
                        playsinline: 1,
                        mute: m ? 1 : 0,
                        vq: 'hd2160',
                        suggestedQuality: 'hd2160',
                        rel: 0,
                        modestbranding: 1,
                    },
                    events: {
                        onReady: (e: YTEvent) => {
                            // Secondary volume lock on ready
                            if (typeof e.target.setVolume === 'function') e.target.setVolume(initialVolume);
                            onLeaderReady(e);
                        },
                        onStateChange: onPlayerStateChange,
                        onError: (e: YTOnErrorEvent) => {
                            console.error("[PrecisionPlayer] Error:", e.data);
                            setIsTerminated(true);
                        },
                    },
                });

                if (ambientElementRef.current) {
                    ambientPlayerRef.current = new window.YT.Player(ambientElementRef.current, {
                        videoId: cleanVideoId,
                        playerVars: {
                            autoplay: 1,
                            controls: 0,
                            disablekb: 1,
                            enablejsapi: 1,
                            mute: 1,
                            suggestedQuality: 'small'
                        },
                        events: {
                            onReady: onAmbientReady,
                        },
                    });
                }
            } catch (err) {
                console.error("[PrecisionPlayer] Creation failed:", err);
                setIsTerminated(true);
            }
        };

        if (window.YT && window.YT.Player) {
            createPlayers();
        } else {
            const checkInterval = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkInterval);
                    createPlayers();
                }
            }, 100);
        }

        return () => {
            isEffectMounted = false;
            leaderReadyRef.current = false;
            ambientReadyRef.current = false;

            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch { }
                playerRef.current = null;
            }
            if (ambientPlayerRef.current) {
                try { ambientPlayerRef.current.destroy(); } catch { }
                ambientPlayerRef.current = null;
            }
            clearRestorationTimeouts();

            if (progressInterval.current) cancelAnimationFrame(progressInterval.current);
            progressInterval.current = null;
            setIsPlayerReady(false);
        };
    }, [hasStarted, videoId, isMounted, onLeaderReady, onAmbientReady, clearRestorationTimeouts, onPlayerStateChange, isMobile]);

    // Independent Audio Sync Effect (Prevents Black-Screen/Re-init on Mute/Volume change)
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
        const ambient = ambientPlayerRef.current;

        if (!player) return;

        if (playing) {
            player.pauseVideo();
            ambient?.pauseVideo();
        } else {
            player.playVideo();
            ambient?.playVideo();
        }
    }, [playing]);

    const seekTo = useCallback((time: number) => {
        playerRef.current?.seekTo(time, true);
        ambientPlayerRef.current?.seekTo(time, true);
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
        const ambient = ambientPlayerRef.current;

        if (!player || !videoId) return;

        setPlayed(0);
        setPlaying(true);
        setIsBuffer(true);
        setIsEnded(false);
        setHasStarted(true);
        setIsSyncing(true);
        setYoutubeUIWait(true);

        const settings = {
            videoId,
            startSeconds: 0,
            suggestedQuality: 'highres'
        };
        player.loadVideoById(settings as YT.VideoByIdSettings);
        ambient?.loadVideoById({
            videoId,
            startSeconds: 0,
            suggestedQuality: 'small'
        } as YT.VideoByIdSettings);
    }, [videoId]);

    const onSetHasStarted = useCallback((val: boolean) => {
        setHasStarted(val);
        if (val) {
            setPlaying(true);
            setIsSyncing(true);
            setYoutubeUIWait(true);
        }
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
        isTerminated,
        isPlayerReady,
        isSyncing,
        isEnded,
        youtubeUIWait,
        playerElementRef,
        ambientElementRef,
        handlePlayPause,
        seekTo,
        setMute,
        setPlayerVolume,
        restart,
        handleSeekMouseDown: () => {
            if (progressInterval.current) cancelAnimationFrame(progressInterval.current);
        },
        handleSeekMouseUp: () => {
            startProgressLoop();
        }
    };
}
