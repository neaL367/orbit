import { BASE_URL } from "@/lib/constants"

/** Origin string for YouTube `origin=` embed param (helps embed security / behavior). */
function embedOrigin() {
  try {
    return new URL(BASE_URL).origin
  } catch {
    return ""
  }
}

/**
 * youtube-nocookie embed URL with conservative params.
 * Note: YouTube picks resolution from viewport + bandwidth; there is no stable URL flag for 1080p.
 * Large iframe + `playsinline` + `origin` gives the player room to choose higher rungs when available.
 */
export function buildYouTubeNoCookieEmbedSrc(videoId: string, options: { autoplay: boolean; muteForAutoplay: boolean }) {
  const id = videoId.trim()
  const origin = embedOrigin()
  const autoplay = options.autoplay ? "1" : "0"
  const mute = options.autoplay && options.muteForAutoplay ? "1" : "0"

  const params = new URLSearchParams({
    autoplay,
    mute,
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    cc_load_policy: "1",
    enablejsapi: "0",
  })
  if (origin) params.set("origin", origin)

  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params.toString()}`
}
