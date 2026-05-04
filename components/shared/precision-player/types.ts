/// <reference types="youtube" />

/**
 * This file maps the official @types/youtube to the local names used in the transition.
 */

export type YTPlayer = YT.Player;

// Use the official event types
export type YTEvent = YT.PlayerEvent;
export type YTOnStateChangeEvent = YT.OnStateChangeEvent;

export enum YTPlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
}

// playerVars we pass plus optional unofficial keys (intersection avoids strictextends edge cases).
export type ExtendedPlayerVars = YT.PlayerVars & {
    autoplay?: 0 | 1;
    vq?: string;
    suggestedQuality?: string;
    /** IFrame API: embedding page URL (policy / player chrome). */
    widget_referrer?: string;
}

export interface ExtendedPlayerOptions extends YT.PlayerOptions {
    playerVars?: ExtendedPlayerVars;
}

export type ExtendedPlayer = YT.Player & {
    setPlaybackQuality(quality: string): void;
    getVideoData(): { video_id: string; author: string; title: string };
    getPlaybackQuality(): YT.SuggestedVideoQuality;
    getAvailablePlaybackRates(): number[];
    setPlaybackRate(suggestedRate: number): void;
    getPlaybackRate(): number;
}

declare global {
    interface Window {
        YT: {
            Player: {
                new(elt: HTMLElement | string, options: ExtendedPlayerOptions): ExtendedPlayer;
            };
        };
        onYouTubeIframeAPIReady: () => void;
        webkitAudioContext: typeof AudioContext;
    }

    interface Document {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
    }

    interface HTMLElement {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
    }
}

export type YTPlayerOptions = YT.PlayerOptions;
