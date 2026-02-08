import { useState, useEffect, useRef, useCallback } from "react";
import { YTPlayer, YTEvent, YTOnStateChangeEvent, YTPlayerState } from "./types";

interface UseYouTubeProps {
    videoId: string | null;
    isMounted: boolean;
    muted: boolean;
    volume: number;
}

export function useYouTube({ videoId, isMounted, muted, volume }: UseYouTubeProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [playing, setPlaying] = useState(false);
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

        progressInterval.current = setInterval(() => {
            const leader = playerRef.current;
            const follower = ambientPlayerRef.current;

            if (!leaderReadyRef.current || !leader) return;

            const leaderTime = typeof leader.getCurrentTime === 'function' ? leader.getCurrentTime() : 0;
            const followerTime = (follower && typeof follower.getCurrentTime === 'function') ? follower.getCurrentTime() : leaderTime;
            const dur = leader.getDuration() ?? 0;

            if (dur > 0) {
                setDuration(dur);
                // We update setPlayed even during sync/wait so the UI progress 
                // moves smoothly while the video plays under the mask.
                setPlayed(leaderTime / dur);
            }

            // Only sync ambient if it's actually ready
            if (follower && ambientReadyRef.current) {
                const drift = leaderTime - followerTime;
                const abs = Math.abs(drift);

                if (abs > 0.75) {
                    if (typeof follower.seekTo === 'function') follower.seekTo(leaderTime, true);
                    return;
                }

                if (abs > 0.12) {
                    if (typeof follower.seekTo === 'function') follower.seekTo(followerTime + drift * 0.35, true);
                }

                try {
                    const rate = typeof leader.getPlaybackRate === 'function' ? leader.getPlaybackRate() : 1;
                    if (rate && typeof follower.setPlaybackRate === 'function') follower.setPlaybackRate(rate);
                } catch { }
            }
        }, 100);
    }, []);

    const onLeaderReady = useCallback((event: YTEvent) => {
        const { volume: currentVol, muted: currentMuted, played: currentPlayed, duration: currentDur, playing: currentPlaying } = syncStateRef.current;
        console.log("[PrecisionPlayer] Leader Ready Event", { currentVol, currentMuted, currentPlayed, currentPlaying });

        leaderReadyRef.current = true;
        setIsPlayerReady(true);

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
            if (typeof event.target.setPlaybackQuality === 'function') event.target.setPlaybackQuality("hd1080");
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
            if (typeof event.target.setPlaybackQuality === 'function') event.target.setPlaybackQuality("hd1080");
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

                            // 1. Precise Sync: Bring the video back to the exact start/resume point
                            // We do this BEFORE revealing, so the "drift" is hidden under the mask.
                            if (typeof target.seekTo === 'function') target.seekTo(syncCaptureTimeRef.current, true);

                            // 2. Surgical Reveal: Give the silent seek a moment to settle before fading/unmuting
                            setTimeout(() => {
                                if (playerRef.current !== target || !target.getIframe()) return;

                                // 3. Aggressive Sound Restore
                                const restoreSound = () => {
                                    if (playerRef.current !== target || !target.getIframe()) return;
                                    if (!m) {
                                        try {
                                            if (typeof target.unMute === 'function') target.unMute();
                                            if (typeof target.setVolume === 'function') target.setVolume(v || 100);
                                            console.log("[PrecisionPlayer] Restoration Pulse:", {
                                                isMuted: target.isMuted(),
                                                currentVol: target.getVolume(),
                                                wantedVol: v || 100
                                            });
                                            if (target.getVolume() === 0 && (v || 100) > 0) {
                                                const nudge = Math.max(1, (v || 100) - 2);
                                                target.setVolume(nudge);
                                                setTimeout(() => {
                                                    if (playerRef.current === target) target.setVolume(v || 100);
                                                }, 40);
                                            }
                                        } catch (e) { console.error("[PrecisionPlayer] Unmute error", e); }
                                    } else {
                                        console.log("[PrecisionPlayer] Restoration: Staying muted");
                                    }
                                };

                                restoreSound();
                                const pulse = (delay: number) => {
                                    const t = setTimeout(restoreSound, delay);
                                    restorationTimeoutsRef.current.push(t);
                                };

                                pulse(100);
                                pulse(500);
                                pulse(1500);
                                pulse(3000);

                                // 4. Sequential UI Reveal
                                setYoutubeUIWait(false); // Mask starts fading out (800ms)

                                setTimeout(() => {
                                    setIsSyncing(false); // Controls finally appear
                                    uiWaitTimeoutRef.current = null;
                                    console.log("[PrecisionPlayer] Uplink fully established.");

                                    // Start ambient feed ONLY after reveal
                                    if (ambientPlayerRef.current) {
                                        try {
                                            if (typeof ambientPlayerRef.current.mute === 'function') ambientPlayerRef.current.mute();
                                            if (typeof ambientPlayerRef.current.setVolume === 'function') ambientPlayerRef.current.setVolume(0);
                                            if (typeof ambientPlayerRef.current.playVideo === 'function') ambientPlayerRef.current.playVideo();
                                        } catch { }
                                    }
                                }, 800);
                            }, 150);
                        }, 3800);
                    }
                } else {
                    setIsSyncing(false);
                    setYoutubeUIWait(false);

                    // Ensure volume is restored if it was zeroed during a cancelled uplink
                    const { muted: m, volume: v } = syncStateRef.current;
                    try {
                        if (!m) {
                            if (typeof event.target.unMute === 'function') event.target.unMute();
                            if (typeof event.target.setVolume === 'function') event.target.setVolume(v || 100);
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
    }, []);

    useEffect(() => {
        console.log("[PrecisionPlayer] Init Effect Triggered", { hasStarted, videoId, isMounted });
        if (!hasStarted || !videoId || !isMounted) return;

        if (hasStarted) {
            setIsSyncing(true);
            setYoutubeUIWait(true); // Set true immediately to prevent flashing
        }
        setIsPlayerReady(false);
        leaderReadyRef.current = false;
        ambientReadyRef.current = false;

        let isEffectMounted = true;

        const createPlayers = () => {
            if (!isEffectMounted || playerRef.current || !playerElementRef.current) return;

            playerRef.current = new (window.YT.Player as any)(playerElementRef.current, {
                videoId,
                playerVars: { autoplay: 1, controls: 0, disablekb: 1, enablejsapi: 1, playsinline: 1, rel: 0, mute: 1 },
                events: {
                    onReady: onLeaderReady,
                    onStateChange: onPlayerStateChange,
                    onError: () => setIsTerminated(true),
                },
            });

            if (ambientElementRef.current) {
                ambientPlayerRef.current = new (window.YT.Player as any)(ambientElementRef.current, {
                    videoId,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        enablejsapi: 1,
                        mute: 1,
                    },
                    events: {
                        onReady: onAmbientReady,
                        onError: () => { ambientReadyRef.current = false; },
                    },
                });
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
    }, [hasStarted, videoId, isMounted, onLeaderReady, onAmbientReady, clearRestorationTimeouts]);

    const handlePlayPause = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;

        if (playing) {
            if (typeof player.pauseVideo === 'function') player.pauseVideo();
        } else {
            console.log("[PrecisionPlayer] Manual Resume");
            if (typeof player.playVideo === 'function') player.playVideo();
        }
    }, [playing]);

    const seekTo = useCallback((time: number) => {
        if (typeof playerRef.current?.seekTo === 'function') playerRef.current.seekTo(time, true);
        if (typeof ambientPlayerRef.current?.seekTo === 'function') ambientPlayerRef.current.seekTo(time, true);
    }, []);

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
