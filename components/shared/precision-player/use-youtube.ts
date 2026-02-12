import { useState, useEffect, useRef, useCallback } from "react";
import { YTPlayer, YTEvent, YTOnStateChangeEvent, YTPlayerState } from "./types";

interface UseYouTubeProps {
    videoId: string | null;
    isMounted: boolean;
    muted: boolean;
    volume: number;
    autoPlay?: boolean;
}

export function useYouTube({ videoId, isMounted, muted, volume, autoPlay = false }: UseYouTubeProps) {
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

    const playerRef = useRef<YTPlayer | null>(null);
    const ambientPlayerRef = useRef<YTPlayer | null>(null);
    const playerElementRef = useRef<HTMLDivElement>(null);
    const ambientElementRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const leaderReadyRef = useRef(false);
    const ambientReadyRef = useRef(false);
    const uiWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const restorationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const syncCaptureTimeRef = useRef<number>(0);

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
        if (progressInterval.current) clearInterval(progressInterval.current);

        let lastAmbientSync = 0;

        progressInterval.current = setInterval(() => {
            const leader = playerRef.current;
            const follower = ambientPlayerRef.current;

            if (!leaderReadyRef.current || !leader) return;

            try {
                // 1. High-frequency UI Progress update (10Hz)
                const leaderTime = leader.getCurrentTime();
                const dur = leader.getDuration();

                if (dur > 0) {
                    setDuration(dur);
                    setPlayed(leaderTime / dur);
                }

                // 2. Low-frequency Ambient Sync (2Hz)
                const now = Date.now();
                if (follower && ambientReadyRef.current && (now - lastAmbientSync > 500)) {
                    lastAmbientSync = now;
                    const followerTime = follower.getCurrentTime();
                    const drift = leaderTime - followerTime;
                    const abs = Math.abs(drift);

                    if (abs > 1.5) {
                        follower.seekTo(leaderTime, true);
                    } else if (abs > 0.4) {
                        follower.seekTo(followerTime + drift * 0.4, true);
                    }

                    const rate = leader.getPlaybackRate();
                    if (rate !== follower.getPlaybackRate()) {
                        follower.setPlaybackRate(rate);
                    }
                }
            } catch (err) { }
        }, 100);
    }, []);

    const onLeaderReady = useCallback((event: YTEvent) => {
        const { volume: currentVol, muted: currentMuted, played: currentPlayed, duration: currentDur, playing: currentPlaying } = syncStateRef.current;
        console.log("[PrecisionPlayer] Leader Ready Event", { currentVol, currentMuted, currentPlayed, currentPlaying });

        leaderReadyRef.current = true;
        setIsPlayerReady(true);

        // Ensure the iframe has the necessary attributes for fullscreen
        try {
            const iframe = event.target.getIframe();
            if (iframe) {
                iframe.setAttribute('allowfullscreen', 'true');
                iframe.setAttribute('webkitallowfullscreen', 'true');
                iframe.setAttribute('mozallowfullscreen', 'true');
            }
        } catch (e) {
            console.warn("[PrecisionPlayer] Failed to apply fullscreen attributes to iframe", e);
        }

        const dur = event.target.getDuration();
        if (dur) setDuration(dur);
        else if (currentDur) setDuration(currentDur);

        const startPoint = currentPlayed * (dur || currentDur || 0);
        syncCaptureTimeRef.current = startPoint;

        if (currentPlaying) {
            console.log("[PrecisionPlayer] Auto-starting video under mask (Strict Silence)...");
            setYoutubeUIWait(true);
            setIsSyncing(true);

            if (typeof event.target.seekTo === 'function') event.target.seekTo(startPoint, true);

            // Hard mute and zero volume for the Uplink phase
            try {
                if (typeof event.target.mute === 'function') event.target.mute();
                if (typeof event.target.setVolume === 'function') event.target.setVolume(0);
            } catch (_e) { }

            if (typeof event.target.playVideo === 'function') event.target.playVideo();
            if (typeof event.target.setPlaybackQuality === 'function') event.target.setPlaybackQuality("highres");
        } else {
            console.log("[PrecisionPlayer] Player ready in paused state.");
            if (currentMuted) {
                if (typeof event.target.mute === 'function') event.target.mute();
            } else {
                if (typeof event.target.unMute === 'function') event.target.unMute();
            }

            if (typeof event.target.seekTo === 'function') event.target.seekTo(startPoint, true);
            if (typeof event.target.pauseVideo === 'function') event.target.pauseVideo();
            setIsSyncing(false);
            setYoutubeUIWait(false);
        }

        if (leaderReadyRef.current && ambientReadyRef.current) {
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

        console.log("[PrecisionPlayer] State Change Event:", state, { isSyncing: currentSync, youtubeUIWait: currentWait });

        switch (state) {
            case YTPlayerState.PLAYING:
                setPlaying(true);
                setIsBuffer(false);
                setIsTerminated(false);
                setIsEnded(false);

                if (currentSync || currentWait) {
                    if (uiWaitTimeoutRef.current) {
                        console.log("[PrecisionPlayer] Uplink wait already in progress...");
                    } else {
                        console.log("[PrecisionPlayer] Starting Uplink wait...");
                        // Hard silence during the wait phase
                        try {
                            if (typeof event.target.mute === 'function') event.target.mute();
                            if (typeof event.target.setVolume === 'function') event.target.setVolume(0);
                        } catch { }

                        clearRestorationTimeouts();
                        uiWaitTimeoutRef.current = setTimeout(() => {
                            const { muted: m, volume: v } = syncStateRef.current;
                            const target = event.target;

                            if (playerRef.current !== target || !target.getIframe()) return;

                            // 1. Instant Audio Restoration (No seek-back jump)
                            const restoreSound = () => {
                                if (playerRef.current !== target || !target.getIframe()) return;
                                if (!m) {
                                    try {
                                        if (typeof target.unMute === 'function') target.unMute();
                                        if (typeof target.setVolume === 'function') target.setVolume(v ?? 26);
                                    } catch (e) { }
                                }
                            };

                            restoreSound();
                            const pulse = (delay: number) => {
                                const t = setTimeout(restoreSound, delay);
                                restorationTimeoutsRef.current.push(t);
                            };

                            pulse(100);
                            pulse(500);

                            // 2. Sequential UI Reveal
                            setYoutubeUIWait(false); // Mask starts fading out (800ms)

                            setTimeout(() => {
                                setIsSyncing(false); // Controls finally appear
                                uiWaitTimeoutRef.current = null;

                                if (ambientPlayerRef.current) {
                                    try {
                                        if (typeof ambientPlayerRef.current.mute === 'function') ambientPlayerRef.current.mute();
                                        if (typeof ambientPlayerRef.current.setVolume === 'function') ambientPlayerRef.current.setVolume(0);
                                        if (typeof ambientPlayerRef.current.playVideo === 'function') ambientPlayerRef.current.playVideo();
                                    } catch { }
                                }
                            }, 300);
                        }, 100);
                    }
                } else {
                    setIsSyncing(false);
                    setYoutubeUIWait(false);

                    // Ensure volume is restored if it was zeroed during a cancelled uplink
                    const { muted: m, volume: v } = syncStateRef.current;
                    try {
                        if (!m) {
                            if (typeof event.target.unMute === 'function') event.target.unMute();
                            if (typeof event.target.setVolume === 'function') event.target.setVolume(v ?? 26);
                        }
                    } catch { }
                }

                if (ambient && !currentSync && !currentWait) {
                    try {
                        if (typeof ambient.mute === 'function') ambient.mute();
                        if (typeof ambient.setVolume === 'function') ambient.setVolume(0);
                        if (typeof ambient.playVideo === 'function') ambient.playVideo();
                    } catch { }
                }
                break;
            case YTPlayerState.PAUSED:
                console.log("[PrecisionPlayer] State: PAUSED");
                setPlaying(false);
                setIsBuffer(false);
                setIsEnded(false);
                if (uiWaitTimeoutRef.current) {
                    clearTimeout(uiWaitTimeoutRef.current);
                    uiWaitTimeoutRef.current = null;
                }
                clearRestorationTimeouts();
                setYoutubeUIWait(false);
                setIsSyncing(false); // Clear syncing on pause to avoid re-triggering wait loops
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
    }, [clearRestorationTimeouts, startProgressLoop]);

    useEffect(() => {
        if (playing) {
            startProgressLoop();
        } else {
            if (progressInterval.current) clearInterval(progressInterval.current);
        }
    }, [playing, startProgressLoop]);

    useEffect(() => {
        console.log("[PrecisionPlayer] Init Effect Triggered", { hasStarted, videoId, isMounted });
        if (!hasStarted || !videoId || !isMounted) return;

        if (hasStarted) {
            setIsSyncing(true);
            setYoutubeUIWait(true); // Set true immediately to prevent flashing

            // Safety Fallback: Force clear syncing after 8 seconds if stuck
            const fallbackTimeout = setTimeout(() => {
                const { isSyncing: s, youtubeUIWait: w } = syncStateRef.current;
                if (s || w) {
                    console.warn("[PrecisionPlayer] Safety fallback triggered: Clearing stuck sync state.");
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

            // Critical Guard: Ensure videoId is present and looks valid (11 chars is standard)
            const cleanVideoId = (videoId || "").trim();
            if (!cleanVideoId || cleanVideoId.length < 5) {
                console.warn("[PrecisionPlayer] Aborting player creation: Invalid videoId", cleanVideoId);
                return;
            }

            console.log("[PrecisionPlayer] Attempting player creation with ID:", cleanVideoId);

            try {
                playerRef.current = new (window.YT.Player as any)(playerElementRef.current, {
                    videoId: cleanVideoId,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        enablejsapi: 1,
                        playsinline: 1,
                        rel: 0,
                        mute: 1,
                        fs: 1,
                        modestbranding: 1,
                        vq: 'highres',
                        playlist: cleanVideoId
                    },
                    events: {
                        onReady: onLeaderReady,
                        onStateChange: onPlayerStateChange,
                        onError: (e: any) => {
                            console.error("[PrecisionPlayer] Leader Player Error:", e.data);
                            setIsTerminated(true);
                        },
                    },
                });
            } catch (err) {
                console.error("[PrecisionPlayer] Fatal error during player creation:", err);
                setIsTerminated(true);
                return;
            }

            if (ambientElementRef.current) {
                try {
                    ambientPlayerRef.current = new (window.YT.Player as any)(ambientElementRef.current, {
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
                            onError: (e: any) => {
                                console.warn("[PrecisionPlayer] Ambient Player Error:", e.data);
                                ambientReadyRef.current = false;
                            },
                        },
                    });
                } catch (err) {
                    console.error("[PrecisionPlayer] Ambient player creation error:", err);
                    ambientReadyRef.current = false;
                }
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
            clearRestorationTimeouts();
            if (ambientPlayerRef.current) {
                try { ambientPlayerRef.current.destroy(); } catch { }
                ambientPlayerRef.current = null;
            }

            if (progressInterval.current) clearInterval(progressInterval.current);
            progressInterval.current = null;
            setIsPlayerReady(false);
        };
    }, [hasStarted, videoId, isMounted, onLeaderReady, onAmbientReady, clearRestorationTimeouts, onPlayerStateChange]);

    const handlePlayPause = useCallback(() => {
        const player = playerRef.current;
        if (!player || isSyncing || youtubeUIWait) return;

        if (playing) {
            if (typeof player.pauseVideo === 'function') player.pauseVideo();
        } else {
            console.log("[PrecisionPlayer] Manual Resume");
            if (typeof player.playVideo === 'function') player.playVideo();
        }
    }, [playing, isSyncing, youtubeUIWait]);

    const seekTo = useCallback((time: number) => {
        if (isSyncing || youtubeUIWait) return;
        if (typeof playerRef.current?.seekTo === 'function') playerRef.current.seekTo(time, true);
        if (typeof ambientPlayerRef.current?.seekTo === 'function') ambientPlayerRef.current.seekTo(time, true);
    }, [isSyncing, youtubeUIWait]);

    const setMute = useCallback((val: boolean) => {
        const leader = playerRef.current;
        const follower = ambientPlayerRef.current;
        if (val) {
            if (typeof leader?.mute === 'function') leader.mute();
            if (typeof follower?.mute === 'function') follower.mute();
        } else {
            if (typeof leader?.unMute === 'function') leader.unMute();
            if (typeof follower?.unMute === 'function') follower.unMute();
        }
    }, []);

    const setPlayerVolume = useCallback((val: number) => {
        if (typeof playerRef.current?.setVolume === 'function') playerRef.current.setVolume(val);
    }, []);

    const restart = useCallback(() => {
        const player = playerRef.current;
        const ambient = ambientPlayerRef.current;

        if (!player || !videoId) return;

        // 1. Reset UI state immediately for responsive feel
        setPlayed(0);
        setPlaying(true);
        setIsBuffer(true);
        setIsEnded(false);
        setHasStarted(true);
        setIsSyncing(true);
        setYoutubeUIWait(true);

        // 2. Use "Nuclear" option: reload the video to force a fresh start
        try {
            // Using loadVideoById is the most robust way to restart an ended video
            player.loadVideoById({
                videoId: videoId,
                startSeconds: 0,
                suggestedQuality: 'highres'
            });

            if (ambient) {
                if (typeof ambient.loadVideoById === 'function') {
                    ambient.loadVideoById({
                        videoId: videoId,
                        startSeconds: 0,
                    });
                }
                // Ensure ambient is muted as it might reset on load
                setTimeout(() => {
                    try {
                        if (typeof ambient.mute === 'function') ambient.mute();
                        if (typeof ambient.setVolume === 'function') ambient.setVolume(0);
                    } catch { }
                }, 500);
            }
        } catch (err) {
            console.error("[useYouTubeLogic] Error during robust restart:", err);
            // Fallback to basic seek/play if loader fails
            player.seekTo(0, true);
            player.playVideo();
        }
    }, [videoId]);

    const onSetHasStarted = useCallback((val: boolean) => {
        setHasStarted(val);
        if (val) {
            setPlaying(true);
            setIsSyncing(true);
            setYoutubeUIWait(true);

            // If the player was somehow pre-initialized, capture its state
            if (playerRef.current) {
                syncCaptureTimeRef.current = playerRef.current.getCurrentTime() || 0;
            }
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
            if (progressInterval.current) clearInterval(progressInterval.current);
        },
        handleSeekMouseUp: () => {
            startProgressLoop();
        }
    };
}
