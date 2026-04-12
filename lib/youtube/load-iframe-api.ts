/**
 * Loads the YouTube IFrame API once per document (custom controls / state).
 * Chains with any existing `onYouTubeIframeAPIReady` handler and polls briefly
 * for late initialization when another script tag already exists.
 */
export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube IFrame API is browser-only"))
  }

  const win = window as Window & {
    YT?: { Player?: unknown }
    onYouTubeIframeAPIReady?: () => void
  }

  if (win.YT?.Player) return Promise.resolve()

  return new Promise((resolve, reject) => {
    let settled = false
    let pollId: number | undefined
    let timeoutId: number | undefined

    const finish = () => {
      if (settled) return
      settled = true
      if (pollId !== undefined) window.clearInterval(pollId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      resolve()
    }

    const prev = win.onYouTubeIframeAPIReady
    win.onYouTubeIframeAPIReady = () => {
      try {
        prev?.()
      } finally {
        finish()
      }
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      tag.async = true
      tag.onerror = () => {
        if (settled) return
        settled = true
        if (pollId !== undefined) window.clearInterval(pollId)
        if (timeoutId !== undefined) window.clearTimeout(timeoutId)
        reject(new Error("Failed to load YouTube IFrame API"))
      }
      document.head.appendChild(tag)
    }

    pollId = window.setInterval(() => {
      if (win.YT?.Player) finish()
    }, 64)

    timeoutId = window.setTimeout(() => {
      if (pollId !== undefined) window.clearInterval(pollId)
      pollId = undefined
      if (!settled && !win.YT?.Player) {
        settled = true
        reject(new Error("YouTube IFrame API timed out"))
      }
    }, 12_000)
  })
}
