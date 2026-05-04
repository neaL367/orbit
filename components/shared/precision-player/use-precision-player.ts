import {
    useRef,
    useCallback,
    useMemo,
    useEffect,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    type TouchEvent as ReactTouchEvent,
} from "react"
import { usePlayerUIState } from "./use-player-ui-state";
import { useYouTube } from "./use-youtube";
import {
    persistTrailerPlaybackRatePreference,
    readTrailerPlaybackRatePreference,
} from "@/lib/youtube/trailer-playback-rate-storage"

interface UsePrecisionPlayerProps {
    url?: string
    videoId?: string
    title?: string
    id?: string
    autoPlay?: boolean
    /** AniList / banner poster for ambient sampling and pause mask (optional). */
    externalPosterUrl?: string | null
}

type RGBTuple = [number, number, number];

const DEFAULT_AMBIENT_TUPLE: RGBTuple = [255, 255, 255];
const DEFAULT_AMBIENT_RGB = "255, 255, 255";
const AMBIENT_SMOOTH_FACTOR = 0.06;
const AMBIENT_MAX_FACTOR = 0.14;
const PALETTE_DEDUPE_DISTANCE = 6;

function normalizeAmbientChannel(value: number) {
    return Math.min(255, Math.max(0, Math.round(value * 1.25 + 10)));
}

function rgbTupleToString(tuple: RGBTuple) {
    return `${tuple[0]}, ${tuple[1]}, ${tuple[2]}`;
}

function mixAmbientColor(a: RGBTuple, b: RGBTuple, t: number): RGBTuple {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
    ];
}

function colorDistance(a: RGBTuple, b: RGBTuple) {
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

function clamp01(value: number) {
    return Math.min(1, Math.max(0, value));
}

function computeRegionAverage(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    region: { x: number; y: number; w: number; h: number }
): RGBTuple | null {
    const startX = Math.floor(region.x * width);
    const startY = Math.floor(region.y * height);
    const endX = Math.max(startX + 1, Math.floor((region.x + region.w) * width));
    const endY = Math.max(startY + 1, Math.floor((region.y + region.h) * height));

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const idx = (y * width + x) * 4;
            const alpha = data[idx + 3];
            if (alpha < 80) continue;

            const pxR = data[idx];
            const pxG = data[idx + 1];
            const pxB = data[idx + 2];

            const max = Math.max(pxR, pxG, pxB);
            const min = Math.min(pxR, pxG, pxB);
            const saturation = max === 0 ? 0 : (max - min) / max;
            const luminance = (0.2126 * pxR + 0.7152 * pxG + 0.0722 * pxB) / 255;

            if (saturation < 0.08 || luminance < 0.05 || luminance > 0.95) continue;

            r += pxR;
            g += pxG;
            b += pxB;
            count++;
        }
    }

    if (count === 0) {
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const idx = (y * width + x) * 4;
                const alpha = data[idx + 3];
                if (alpha < 80) continue;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
            }
        }
    }

    if (count === 0) return null;

    return [
        normalizeAmbientChannel(r / count),
        normalizeAmbientChannel(g / count),
        normalizeAmbientChannel(b / count),
    ];
}

async function sampleImagePalette(src: string): Promise<RGBTuple[]> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.referrerPolicy = "no-referrer";
        img.decoding = "async";

        img.onload = () => {
            try {
                const size = 36;
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                if (!ctx) {
                    resolve([]);
                    return;
                }

                ctx.drawImage(img, 0, 0, size, size);
                const { data } = ctx.getImageData(0, 0, size, size);

                const regions = [
                    { x: 0, y: 0, w: 1, h: 1 },
                    { x: 0, y: 0, w: 0.5, h: 0.5 },
                    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
                    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
                    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
                    { x: 0.2, y: 0.14, w: 0.6, h: 0.28 },
                    { x: 0.2, y: 0.58, w: 0.6, h: 0.28 },
                    { x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
                ];

                const colors = regions
                    .map((region) => computeRegionAverage(data, size, size, region))
                    .filter((color): color is RGBTuple => color !== null);

                resolve(colors);
            } catch {
                resolve([]);
            }
        };

        img.onerror = () => resolve([]);
        img.src = src;
    });
}

/** Let the embed paint and auto-hide native chrome before we stack PRECISION chrome on top. */
const YOUTUBE_EMBED_UI_SETTLE_MS = 1150;

/** Hide PRECISION chrome only after YouTube's own auto-hide window; base delay for idle playback. */
const CONTROLS_AUTOHIDE_MS = 3800;
/** Initial reveal + scrubbing - native chrome stays up longer. */
const CONTROLS_AUTOHIDE_LINGER_MS = 5200;
/** After click play/pause or seek release - align with transport + YT bar. */
const CONTROLS_AUTOHIDE_TRANSPORT_MS = 4400;

export function usePrecisionPlayer({
    url,
    videoId: propVideoId,
    title,
    id = "player",
    autoPlay,
    externalPosterUrl,
}: UsePrecisionPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isSeekingRef = useRef(false);
    const controlsLockRef = useRef(false);
    const precisionChromeGateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [precisionChromeGate, setPrecisionChromeGate] = useState(false);

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

    const [playbackRatePreference, setPlaybackRatePreference] = useState(() => readTrailerPlaybackRatePreference() ?? 1)

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
            if (propVideoId.length === 11 && !propVideoId.includes("/") && !propVideoId.includes("?")) {
                return propVideoId;
            }
            const extracted = extractId(propVideoId);
            if (extracted) return extracted;
            return propVideoId;
        }

        if (!url) return null;
        return extractId(url);
    }, [url, propVideoId]);

    const thumbnailUrl =
        externalPosterUrl?.trim() ||
        (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null)
    const [ambientColorRgb, setAmbientColorRgb] = useState(DEFAULT_AMBIENT_RGB);
    const [ambientPalette, setAmbientPalette] = useState<RGBTuple[]>([DEFAULT_AMBIENT_TUPLE]);

    const ambientTargetRef = useRef<RGBTuple>(DEFAULT_AMBIENT_TUPLE);
    const ambientCurrentRef = useRef<RGBTuple>(DEFAULT_AMBIENT_TUPLE);
    const ambientDriftRef = useRef(0);
    const lastAmbientStringRef = useRef(DEFAULT_AMBIENT_RGB);

    const {
        hasStarted,
        setHasStarted,
        playing,
        played,
        setPlayed,
        duration,
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
        handleSeekMouseDown: youtubeHandleSeekMouseDown,
        handleSeekMouseUp: youtubeHandleSeekMouseUp,
    } = useYouTube({ videoId, isMounted, muted, volume, playbackRate: playbackRatePreference, autoPlay });

    const openPrecisionChromeGate = useCallback(() => {
        if (precisionChromeGateTimerRef.current) {
            clearTimeout(precisionChromeGateTimerRef.current);
            precisionChromeGateTimerRef.current = null;
        }
        setPrecisionChromeGate(true);
    }, []);

    useEffect(() => {
        if (!isPlayerReady) {
            setPrecisionChromeGate(false);
            if (precisionChromeGateTimerRef.current) {
                clearTimeout(precisionChromeGateTimerRef.current);
                precisionChromeGateTimerRef.current = null;
            }
            return;
        }
        setPrecisionChromeGate(false);
        precisionChromeGateTimerRef.current = setTimeout(() => {
            precisionChromeGateTimerRef.current = null;
            setPrecisionChromeGate(true);
        }, YOUTUBE_EMBED_UI_SETTLE_MS);
        return () => {
            if (precisionChromeGateTimerRef.current) {
                clearTimeout(precisionChromeGateTimerRef.current);
                precisionChromeGateTimerRef.current = null;
            }
        };
    }, [isPlayerReady]);

    useEffect(() => {
        if (!isMounted || !videoId) {
            ambientCurrentRef.current = DEFAULT_AMBIENT_TUPLE;
            ambientTargetRef.current = DEFAULT_AMBIENT_TUPLE;
            ambientDriftRef.current = 0;
            lastAmbientStringRef.current = DEFAULT_AMBIENT_RGB;
            setAmbientPalette([DEFAULT_AMBIENT_TUPLE]);
            setAmbientColorRgb(DEFAULT_AMBIENT_RGB);
            return;
        }

        let cancelled = false;

        const loadPalette = async () => {
            const sources = [
                ...(externalPosterUrl?.trim() ? [externalPosterUrl.trim()] : []),
                `https://i.ytimg.com/vi/${videoId}/0.jpg`,
                `https://i.ytimg.com/vi/${videoId}/1.jpg`,
                `https://i.ytimg.com/vi/${videoId}/2.jpg`,
                `https://i.ytimg.com/vi/${videoId}/3.jpg`,
                `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
                `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            ];

            const sampledGroups = await Promise.all(sources.map((src) => sampleImagePalette(src)));
            const sampled = sampledGroups.flat();

            if (cancelled) return;

            if (sampled.length === 0) {
                setAmbientPalette([DEFAULT_AMBIENT_TUPLE]);
                ambientCurrentRef.current = DEFAULT_AMBIENT_TUPLE;
                ambientTargetRef.current = DEFAULT_AMBIENT_TUPLE;
                ambientDriftRef.current = 0;
                lastAmbientStringRef.current = DEFAULT_AMBIENT_RGB;
                setAmbientColorRgb(DEFAULT_AMBIENT_RGB);
                return;
            }

            const unique: RGBTuple[] = [];
            for (const color of sampled) {
                if (!unique.some((existing) => colorDistance(existing, color) < PALETTE_DEDUPE_DISTANCE)) {
                    unique.push(color);
                }
            }

            const palette = unique.length > 0 ? unique : [sampled[0]];
            setAmbientPalette(palette);
            ambientCurrentRef.current = palette[0];
            ambientTargetRef.current = palette[0];
            ambientDriftRef.current = 0;
            const initial = rgbTupleToString(palette[0]);
            lastAmbientStringRef.current = initial;
            setAmbientColorRgb(initial);
        };

        loadPalette();

        return () => {
            cancelled = true;
        };
    }, [videoId, isMounted, externalPosterUrl]);

    useEffect(() => {
        const palette = ambientPalette.length > 0 ? ambientPalette : [DEFAULT_AMBIENT_TUPLE];
        if (!hasStarted || palette.length === 1) {
            ambientTargetRef.current = palette[0];
            return;
        }

        if (playing) {
            ambientDriftRef.current += 0.0026;
        }

        const progress = clamp01(Number.isFinite(played) ? played : 0);
        const basePosition = progress * (palette.length - 1);
        const driftOffset = Math.sin(ambientDriftRef.current * Math.PI * 2) * 0.28;
        const cursor = Math.min(Math.max(basePosition + driftOffset, 0), palette.length - 1);

        const fromIndex = Math.floor(cursor);
        const toIndex = Math.min(palette.length - 1, fromIndex + 1);
        const mix = cursor - fromIndex;

        ambientTargetRef.current = mixAmbientColor(palette[fromIndex], palette[toIndex], mix);
    }, [ambientPalette, played, hasStarted, playing]);

    useEffect(() => {
        if (!isMounted) return;

        let rafId = 0;

        const tick = () => {
            const current = ambientCurrentRef.current;
            const target = ambientTargetRef.current;

            const distance = colorDistance(current, target);
            const adaptiveFactor = Math.min(
                AMBIENT_MAX_FACTOR,
                AMBIENT_SMOOTH_FACTOR + distance / 520
            );

            const next: RGBTuple = [
                current[0] + (target[0] - current[0]) * adaptiveFactor,
                current[1] + (target[1] - current[1]) * adaptiveFactor,
                current[2] + (target[2] - current[2]) * adaptiveFactor,
            ];

            ambientCurrentRef.current = next;

            const rounded: RGBTuple = [
                Math.round(next[0]),
                Math.round(next[1]),
                Math.round(next[2]),
            ];
            const nextString = rgbTupleToString(rounded);

            if (nextString !== lastAmbientStringRef.current) {
                lastAmbientStringRef.current = nextString;
                setAmbientColorRgb(nextString);
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [isMounted]);

    const clearHideControlsTimeout = useCallback(() => {
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
            hideControlsTimeout.current = null;
        }
    }, []);

    const scheduleControlsHide = useCallback((delay = CONTROLS_AUTOHIDE_MS) => {
        clearHideControlsTimeout();

        if (!playing || controlsLockRef.current) return;

        hideControlsTimeout.current = setTimeout(() => {
            if (controlsLockRef.current || isSeekingRef.current) return;
            setControlsVisible(false);
        }, delay);
    }, [playing, setControlsVisible, clearHideControlsTimeout]);

    const showControls = useCallback((hideDelay = CONTROLS_AUTOHIDE_MS) => {
        setControlsVisible(true);
        if (playing) {
            scheduleControlsHide(hideDelay);
        } else {
            clearHideControlsTimeout();
        }
    }, [playing, setControlsVisible, scheduleControlsHide, clearHideControlsTimeout]);

    useEffect(() => {
        if (isPlayerReady) {
            showControls(CONTROLS_AUTOHIDE_LINGER_MS);
        }
    }, [isPlayerReady, showControls]);

    useEffect(() => {
        return () => clearHideControlsTimeout();
    }, [clearHideControlsTimeout]);

    const handleSeekMouseDown = useCallback(() => {
        openPrecisionChromeGate();
        isSeekingRef.current = true;
        controlsLockRef.current = true;
        clearHideControlsTimeout();
        youtubeHandleSeekMouseDown();
    }, [clearHideControlsTimeout, openPrecisionChromeGate, youtubeHandleSeekMouseDown]);

    const handleSeekMouseUp = useCallback(() => {
        openPrecisionChromeGate();
        isSeekingRef.current = false;
        controlsLockRef.current = false;
        youtubeHandleSeekMouseUp();
        showControls(CONTROLS_AUTOHIDE_TRANSPORT_MS);
    }, [openPrecisionChromeGate, youtubeHandleSeekMouseUp, showControls]);

    const handleMouseMove = useCallback((event?: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
        openPrecisionChromeGate();
        let hideDelay = CONTROLS_AUTOHIDE_MS;

        if (event?.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            let clientY: number | null = null;

            if ("clientY" in event) {
                clientY = event.clientY;
            } else if ("touches" in event && event.touches.length > 0) {
                clientY = event.touches[0].clientY;
            }

            if (clientY !== null) {
                const positionY = clientY - rect.top;
                const ratio = positionY / Math.max(rect.height, 1);
                if (ratio > 0.72) {
                    hideDelay = 6200;
                }
            }
        }

        showControls(hideDelay);
    }, [openPrecisionChromeGate, showControls]);

    const handleMouseLeave = useCallback(() => {
        if (!playing || controlsLockRef.current || isSeekingRef.current) return;
        scheduleControlsHide(450);
    }, [playing, scheduleControlsHide]);

    const onControlsPointerEnter = useCallback(() => {
        openPrecisionChromeGate();
        controlsLockRef.current = true;
        setControlsVisible(true);
        clearHideControlsTimeout();
    }, [clearHideControlsTimeout, openPrecisionChromeGate, setControlsVisible]);

    const onControlsPointerLeave = useCallback(() => {
        controlsLockRef.current = false;
        scheduleControlsHide(900);
    }, [scheduleControlsHide]);

    const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        openPrecisionChromeGate();
        const val = parseFloat(e.target.value);
        const time = val * duration;
        setPlayed(val);
        seekTo(time);
        showControls(CONTROLS_AUTOHIDE_LINGER_MS);
    }, [duration, openPrecisionChromeGate, setPlayed, seekTo, showControls]);

    const onSetMuted = useCallback((val: boolean) => {
        setMuted(val);
        setMute(val);
        showControls(CONTROLS_AUTOHIDE_LINGER_MS);
    }, [setMute, setMuted, showControls]);

    const onSetVolume = useCallback((val: number) => {
        setVolume(val);
        setPlayerVolume(val);
        showControls(CONTROLS_AUTOHIDE_LINGER_MS);
    }, [setPlayerVolume, setVolume, showControls]);

    const toggleFullscreen = useCallback(() => {
        const doc = document;
        const container = containerRef.current;
        if (!container) return;

        if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
            try {
                if (container.requestFullscreen) container.requestFullscreen();
                else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
                else if (container.mozRequestFullScreen) container.mozRequestFullScreen();
                else if (container.msRequestFullscreen) container.msRequestFullscreen();
            } catch {
                /* fullscreen blocked or unsupported */
            }
        } else {
            try {
                if (doc.exitFullscreen) void doc.exitFullscreen();
                else if (doc.webkitExitFullscreen) void doc.webkitExitFullscreen();
                else if (doc.mozCancelFullScreen) void doc.mozCancelFullScreen();
                else if (doc.msExitFullscreen) void doc.msExitFullscreen();
            } catch {
                /* noop */
            }
        }
    }, [containerRef]);

    const handleContainerKeyDown = useCallback(
        (e: ReactKeyboardEvent<HTMLDivElement>) => {
            const t = e.target as HTMLElement
            if (
                t.tagName === "INPUT" ||
                t.tagName === "TEXTAREA" ||
                t.tagName === "SELECT" ||
                (t.tagName === "BUTTON" && (e.key === " " || e.key === "Enter"))
            ) {
                return
            }

            openPrecisionChromeGate()

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault()
                    handlePlayPause()
                    showControls(CONTROLS_AUTOHIDE_TRANSPORT_MS)
                    break
                case "f":
                    e.preventDefault()
                    toggleFullscreen()
                    break
                case "m":
                    e.preventDefault()
                    onSetMuted(!muted)
                    break
                case "arrowleft":
                case "j":
                    e.preventDefault()
                    seekTo(Math.max(0, played * duration - 5))
                    showControls(CONTROLS_AUTOHIDE_TRANSPORT_MS)
                    break
                case "arrowright":
                case "l":
                    e.preventDefault()
                    seekTo(Math.min(duration, played * duration + 5))
                    showControls(CONTROLS_AUTOHIDE_TRANSPORT_MS)
                    break
                case ",":
                    e.preventDefault()
                    seekTo(Math.max(0, played * duration - 1 / 24))
                    showControls(CONTROLS_AUTOHIDE_TRANSPORT_MS)
                    break
                case ".":
                    e.preventDefault()
                    seekTo(Math.min(duration, played * duration + 1 / 24))
                    showControls(CONTROLS_AUTOHIDE_TRANSPORT_MS)
                    break
                default:
            }
        },
        [
            handlePlayPause,
            toggleFullscreen,
            onSetMuted,
            muted,
            played,
            duration,
            seekTo,
            showControls,
            openPrecisionChromeGate,
        ]
    )

    const formatTime = useCallback((s: number) => {
        if (isNaN(s)) return "00:00";
        const d = new Date(s * 1000);
        const h = d.getUTCHours();
        const m = d.getUTCMinutes();
        const sec = d.getUTCSeconds().toString().padStart(2, "0");
        return h ? `${h}:${m.toString().padStart(2, "0")}:${sec}` : `${m}:${sec}`;
    }, []);

    const onPlayPause = useCallback(() => {
        openPrecisionChromeGate();
        handlePlayPause();
        showControls(CONTROLS_AUTOHIDE_TRANSPORT_MS);
    }, [openPrecisionChromeGate, handlePlayPause, showControls]);

    const onRestart = useCallback(() => {
        openPrecisionChromeGate();
        restart();
        showControls(CONTROLS_AUTOHIDE_TRANSPORT_MS);
    }, [openPrecisionChromeGate, restart, showControls]);

    const handlers = useMemo(
        () => ({
            handleMouseMove,
            handleMouseLeave,
            onControlsPointerEnter,
            onControlsPointerLeave,
            handlePlayPause: onPlayPause,
            handleSeekChange,
            onSetMuted,
            onSetVolume,
            onSetHasStarted: setHasStarted,
            onRestart,
            formatTime,
            handleSeekMouseDown,
            handleSeekMouseUp,
            toggleFullscreen,
            getVideoData,
            getAvailablePlaybackRates,
            setPlaybackRate: (rate: number) => {
                setPlaybackRatePreference(rate)
                persistTrailerPlaybackRatePreference(rate)
                setPlaybackRate(rate)
            },
            getPlaybackRate,
            handleContainerKeyDown,
        }),
        [
            handleMouseMove,
            handleMouseLeave,
            onControlsPointerEnter,
            onControlsPointerLeave,
            onPlayPause,
            handleSeekChange,
            onSetMuted,
            onSetVolume,
            setHasStarted,
            onRestart,
            formatTime,
            handleSeekMouseDown,
            handleSeekMouseUp,
            toggleFullscreen,
            getVideoData,
            getAvailablePlaybackRates,
            setPlaybackRate,
            getPlaybackRate,
            handleContainerKeyDown,
        ]
    )

    const refs = useMemo(() => ({
        containerRef,
        playerElementRef,
    }), [playerElementRef]);

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
            isPlayPending,
            isSyncing,
            isEnded,
            isTerminated,
            videoId,
            isMobile,
            controlsVisible,
            precisionChromeGate,
            isFullscreen,
            thumbnailUrl,
            ambientColorRgb,
            visualPlaying: isPlayerReady && (playing || isBuffer) && !youtubeUIWait && !isSyncing && !isEnded && !isTerminated,
            youtubeUIWait,
            isPlayerReady,
            title,
            id,
        },
        refs,
        handlers,
    };
}
