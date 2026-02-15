/**
 * This file maps the official @types/youtube to the local names used in the transition.
 */

export type YTPlayer = YT.Player;

// Use the official event types
export type YTEvent = YT.PlayerEvent;
export type YTOnStateChangeEvent = YT.OnStateChangeEvent;
export type YTOnErrorEvent = YT.OnErrorEvent;

export enum YTPlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
}

// Extend official types to support vq and suggestedQuality which are unofficial but functional
export interface ExtendedPlayerVars extends YT.PlayerVars {
    vq?: string;
    suggestedQuality?: string;
}

export interface ExtendedPlayerOptions extends YT.PlayerOptions {
    playerVars?: ExtendedPlayerVars;
}

export interface ExtendedPlayer extends YT.Player {
    setPlaybackQuality(quality: string): void;
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
