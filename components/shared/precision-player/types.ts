/**
 * This file maps the official @types/youtube to the local names used in the transition.
 */

export type YTPlayer = YT.Player;

// Use the official event types
export type YTEvent = YT.PlayerEvent;
export type YTOnStateChangeEvent = YT.OnStateChangeEvent;

/**
 * We define the enum locally to avoid ReferenceError: YT is not defined
 * during module evaluation, as the YT global is only available after 
 * the YouTube IFrame API script is loaded.
 */
export enum YTPlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
}

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

export type YTPlayerOptions = YT.PlayerOptions;
