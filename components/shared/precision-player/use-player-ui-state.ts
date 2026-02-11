import { useState, useEffect } from "react";

export function usePlayerUIState() {
    const [isMounted, setIsMounted] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(26);
    const [isMobile, setIsMobile] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isFakeFullscreen, setIsFakeFullscreen] = useState(false);
    const [isEnhanced, setIsEnhanced] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const checkMobile = () => (typeof window !== 'undefined' ? (window.innerWidth <= 768) : false);
        setIsMobile(checkMobile());

        const handleResize = () => setIsMobile(checkMobile());
        window.addEventListener("resize", handleResize);

        const handleFullscreenChange = () => {
            const doc = document as any;
            setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement));
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        return () => {
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
        };
    }, []);

    return {
        isMounted,
        muted,
        setMuted,
        volume,
        setVolume,
        isMobile,
        controlsVisible,
        setControlsVisible,
        isFullscreen,
        isFakeFullscreen,
        setIsFakeFullscreen,
    };
}
