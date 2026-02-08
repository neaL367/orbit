import { useRef, useCallback, useMemo } from "react";
import { usePlayerUIState } from "./use-player-ui-state";
import { useYouTube } from "./use-youtube";

interface UsePrecisionPlayerProps {
    url?: string;
    videoId?: string;
    title?: string;
    id?: string;
}

export function usePrecisionPlayer({ url, videoId: propVideoId, title, id = "player" }: UsePrecisionPlayerProps) {
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
    } = usePlayerUIState();

    const videoId = useMemo(() => {
        if (propVideoId) return propVideoId;
        if (!url) return null;
        const match =
            url.match(/[?&]v=([^&]+)/) ||
            url.match(
                /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/
            );
        return (match?.[1] ?? match?.[2] ?? null) || null;
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
    } = useYouTube({ videoId, isMounted, muted, volume });

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
        setPlayerVolume(val);
    }, [setPlayerVolume, setVolume]);

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
        handleSeekMouseUp
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
        handleSeekMouseUp
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
            thumbnailUrl,
            visualPlaying: (playing || isBuffer) && !isSyncing && !youtubeUIWait,
            youtubeUIWait,
            isPlayerReady,
            title,
            id
        },
        refs,
        handlers
    };
}
