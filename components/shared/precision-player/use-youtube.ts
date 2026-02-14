import { useState, useEffect, useRef, useCallback } from "react";
import { ExtendedPlayer, YTEvent, YTOnStateChangeEvent, YTPlayerState } from "./types";

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

    const playerRef = useRef<ExtendedPlayer | null>(null);
    const ambientPlayerRef = useRef<ExtendedPlayer | null>(null);
    const playerElementRef = useRef<HTMLDivElement>(null);
    const ambientElementRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
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
        if (progressInterval.current) clearInterval(progressInterval.current);

        let lastAmbientSync = 0;

        progressInterval.current = setInterval(() => {
            const player = playerRef.current;
            const ambient = ambientPlayerRef.current;

            if (!leaderReadyRef.current || !player) return;

            try {
                const currentTime = player.getCurrentTime();
                const dur = player.getDuration();

                if (dur > 0) {
                    setDuration(dur);
                    setPlayed(currentTime / dur);
                }

                // Sync Ambient Slave
                const now = Date.now();
                if (ambient && ambientReadyRef.current && (now - lastAmbientSync > 500)) {
                    lastAmbientSync = now;
                    const ambientTime = ambient.getCurrentTime();
                    const drift = currentTime - ambientTime;
                    if (Math.abs(drift) > 1.5) {
                        ambient.seekTo(currentTime, true);
                    }
                }
            } catch { }
        }, 100);
    }, []);

    const onLeaderReady = useCallback((event: YTEvent) => {
        const { volume: currentVol, muted: currentMuted, played: currentPlayed, playing: currentPlaying } = syncStateRef.current;
        console.log("[PrecisionPlayer] Leader Ready", { currentVol, currentMuted });

        leaderReadyRef.current = true;

        const dur = event.target.getDuration();
        if (dur) setDuration(dur);

        const startPoint = currentPlayed * (dur || 0);

        if (currentPlaying) {
            setYoutubeUIWait(true);
            setIsSyncing(true);
            if (typeof event.target.seekTo === 'function') event.target.seekTo(startPoint, true);
            if (typeof event.target.setVolume === 'function') event.target.setVolume(currentVol);
            if (currentMuted) {
                if (typeof event.target.mute === 'function') event.target.mute();
            } else {
                if (typeof event.target.unMute === 'function') event.target.unMute();
            }
            if (typeof event.target.playVideo === 'function') event.target.playVideo();
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
                        if (typeof ambient.playVideo === 'function') ambient.playVideo();
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
            if (progressInterval.current) clearInterval(progressInterval.current);
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

            try {
                playerRef.current = new window.YT.Player(playerElementRef.current!, {
                    videoId: cleanVideoId,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        enablejsapi: 1,
                        playsinline: 1,
                        mute: muted ? 1 : 0,
                        vq: 'hd1080',
                    },
                    events: {
                        onReady: onLeaderReady,
                        onStateChange: onPlayerStateChange,
                        onError: (e: any) => {
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

            if (progressInterval.current) clearInterval(progressInterval.current);
            progressInterval.current = null;
            setIsPlayerReady(false);
        };
    }, [hasStarted, videoId, isMounted, muted, onLeaderReady, onAmbientReady, clearRestorationTimeouts, onPlayerStateChange]);

    const handlePlayPause = useCallback(() => {
        if (isSyncing || youtubeUIWait) return;
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
    }, [playing, isSyncing, youtubeUIWait]);

    const seekTo = useCallback((time: number) => {
        if (isSyncing || youtubeUIWait) return;
        playerRef.current?.seekTo(time, true);
        ambientPlayerRef.current?.seekTo(time, true);
    }, [isSyncing, youtubeUIWait]);

    const setMute = useCallback((val: boolean) => {
        if (val) playerRef.current?.mute();
        else playerRef.current?.unMute();
    }, []);

    const setPlayerVolume = useCallback((val: number) => {
        playerRef.current?.setVolume(val);
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

        const settings = { videoId, startSeconds: 0 };
        player.loadVideoById(settings as any);
        ambient?.loadVideoById({ videoId, startSeconds: 0 } as any);
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
            if (progressInterval.current) clearInterval(progressInterval.current);
        },
        handleSeekMouseUp: () => {
            startProgressLoop();
        }
    };
}
