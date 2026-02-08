import { useState, useEffect } from "react";

export function usePlayerUIState() {
    const [isMounted, setIsMounted] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isMobile, setIsMobile] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const checkMobile = () => (typeof window !== 'undefined' ? (window.innerWidth <= 768) : false);
        setIsMobile(checkMobile());

        const handleResize = () => setIsMobile(checkMobile());
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
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
    };
}
