const STORAGE_KEY = "orbit.trailer.playbackRate"

const ALLOWED_RATES = new Set([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2])

function getSessionStorage(): Storage | null {
  if (typeof globalThis === "undefined") return null
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

/** Last trailer playback rate for this tab; used for subsequent trailers. */
export function readTrailerPlaybackRatePreference(): number | null {
  const storage = getSessionStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw == null) return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    if (!ALLOWED_RATES.has(n)) return null
    return n
  } catch {
    return null
  }
}

export function persistTrailerPlaybackRatePreference(rate: number) {
  const storage = getSessionStorage()
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, String(rate))
  } catch {
    /* private mode / quota */
  }
}

