import { useRef, useCallback, useMemo, useEffect } from "react";
import { usePlayerUIState } from "./use-player-ui-state";
import { useYouTube } from "./use-youtube";

interface UsePrecisionPlayerProps {
    url?: string;
    videoId?: string;
    title?: string;
    id?: string;
    autoPlay?: boolean;
}

export function usePrecisionPlayer({ url, videoId: propVideoId, title, id = "player", autoPlay }: UsePrecisionPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const isSeekingRef = useRef(false);

    const {
        isMounted,
        muted,
        setMuted,
        volume,
        setVolume,
        isMobile,
        controlsVisible,
        setControlsVisible,
        isFullscreen,
    } = usePlayerUIState();

    const videoId = useMemo(() => {
        const extractId = (str: string) => {
            const match =
                str.match(/[?&]v=([^&]+)/) ||
                str.match(
                    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/
                );
            return (match?.[1] ?? match?.[2] ?? null) || null;
        };

        if (propVideoId) {
            // If it's already a short ID (11 chars typically), use it. 
            // Otherwise, try to extract from it as if it were a URL.
            if (propVideoId.length === 11 && !propVideoId.includes('/') && !propVideoId.includes('?')) {
                return propVideoId;
            }
            const extracted = extractId(propVideoId);
            if (extracted) return extracted;
            return propVideoId; // Fallback to original
        }

        if (!url) return null;
        return extractId(url);
    }, [url, propVideoId]);

    const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null;

    const {
        hasStarted,
        setHasStarted,
        playing,
        played,
        setPlayed,
        duration,
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
        handleSeekMouseDown: youtubeHandleSeekMouseDown,
        handleSeekMouseUp: youtubeHandleSeekMouseUp,
    } = useYouTube({ videoId, isMounted, muted, volume, autoPlay });

    const handleSeekMouseDown = useCallback(() => {
        isSeekingRef.current = true;
        youtubeHandleSeekMouseDown();
    }, [youtubeHandleSeekMouseDown]);

    const handleSeekMouseUp = useCallback(() => {
        isSeekingRef.current = false;
        youtubeHandleSeekMouseUp();
    }, [youtubeHandleSeekMouseUp]);

    const handleMouseMove = useCallback(() => {
        setControlsVisible(true);
        if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
        if (playing) hideControlsTimeout.current = setTimeout(() => setControlsVisible(false), 3000);
    }, [playing, setControlsVisible]);

    const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        const time = val * duration;
        setPlayed(val);
        seekTo(time);
    }, [duration, setPlayed, seekTo]);

    const onSetMuted = useCallback((val: boolean) => {
        setMuted(val);
        setMute(val);
    }, [setMute, setMuted]);

    const onSetVolume = useCallback((val: number) => {
        setVolume(val);
        // Quadratic Volume Scaling for natural hearing response
        const naturalVolume = Math.pow(val / 100, 2) * 100;
        setPlayerVolume(naturalVolume);
    }, [setPlayerVolume, setVolume]);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        const doc = document as any;
        const container = containerRef.current as any;

        if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
            try {
                if (container.requestFullscreen) container.requestFullscreen();
                else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
                else if (container.mozRequestFullScreen) container.mozRequestFullScreen();
                else if (container.msRequestFullscreen) container.msRequestFullscreen();
            } catch (err) {
                console.error("Fullscreen request failed", err);
            }
        } else {
            try {
                if (doc.exitFullscreen) doc.exitFullscreen();
                else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
                else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
                else if (doc.msExitFullscreen) doc.msExitFullscreen();
            } catch (err) {
                console.error("Exit fullscreen failed", err);
            }
        }
    }, [containerRef]);

    // Tactical Keyboard System
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case "f":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case "m":
                    e.preventDefault();
                    onSetMuted(!muted);
                    break;
                case "arrowleft":
                case "j":
                    e.preventDefault();
                    seekTo(Math.max(0, (played * duration) - 5));
                    break;
                case "arrowright":
                case "l":
                    e.preventDefault();
                    seekTo(Math.min(duration, (played * duration) + 5));
                    break;
                case ",": // Frame backward (~1/24s)
                    e.preventDefault();
                    seekTo(Math.max(0, (played * duration) - (1 / 24)));
                    break;
                case ".": // Frame forward (~1/24s)
                    e.preventDefault();
                    seekTo(Math.min(duration, (played * duration) + (1 / 24)));
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handlePlayPause, toggleFullscreen, onSetMuted, muted, played, duration, seekTo]);

    const formatTime = useCallback((s: number) => {
        if (isNaN(s)) return "00:00";
        const d = new Date(s * 1000);
        const h = d.getUTCHours();
        const m = d.getUTCMinutes();
        const sec = d.getUTCSeconds().toString().padStart(2, "0");
        return h ? `${h}:${m.toString().padStart(2, "0")}:${sec}` : `${m}:${sec}`;
    }, []);

    const handlers = useMemo(() => ({
        handleMouseMove,
        handlePlayPause,
        handleSeekChange,
        onSetMuted,
        onSetVolume,
        onSetHasStarted: setHasStarted,
        onRestart: restart,
        formatTime,
        handleSeekMouseDown,
        handleSeekMouseUp,
        toggleFullscreen,
    }), [
        handleMouseMove,
        handlePlayPause,
        handleSeekChange,
        onSetMuted,
        onSetVolume,
        setHasStarted,
        restart,
        formatTime,
        handleSeekMouseDown,
        handleSeekMouseUp,
        toggleFullscreen,
    ]);

    const refs = useMemo(() => ({
        containerRef,
        ambientElementRef,
        playerElementRef
    }), [ambientElementRef, playerElementRef]);

    return {
        state: {
            isMounted,
            hasStarted,
            playing,
            muted,
            volume,
            played,
            duration,
            bufferProgress: 0,
            isBuffer,
            isSyncing,
            isEnded,
            isTerminated,
            videoId,
            isMobile,
            controlsVisible,
            isFullscreen,
            thumbnailUrl,
            visualPlaying: (playing || isBuffer || isSyncing || youtubeUIWait) && !isEnded && !isTerminated,
            youtubeUIWait,
            isPlayerReady,
            title,
            id
        },
        refs,
        handlers
    };
}
