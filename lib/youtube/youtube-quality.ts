/** YouTube IFrame API `getAvailableQualityLevels` / `setPlaybackQuality` tokens (best-first). */
export const YOUTUBE_QUALITY_BEST_FIRST = [
  "highres",
  "hd2160",
  "hd1440",
  "hd1080",
  "hd720",
  "large",
  "medium",
  "small",
  "tiny",
] as const

export type YouTubeQualityToken = (typeof YOUTUBE_QUALITY_BEST_FIRST)[number]

export function pickHighestYouTubeQuality(available: string[]): string | null {
  for (const q of YOUTUBE_QUALITY_BEST_FIRST) {
    if (available.includes(q)) return q
  }
  return available[0] ?? null
}

/** Human label for the chrome badge (YouTube still controls actual ladder / ABR). */
export function formatYouTubeQualityLabel(code: string | undefined): string {
  if (!code || code === "unknown") return ""
  switch (code) {
    case "highres":
      return "4K+"
    case "hd2160":
      return "4K"
    case "hd1440":
      return "1440p"
    case "hd1080":
      return "1080p"
    case "hd720":
      return "720p"
    case "large":
      return "480p"
    case "medium":
      return "360p"
    case "small":
      return "240p"
    case "tiny":
      return "144p"
    case "auto":
      return "Auto"
    default:
      return code
  }
}
