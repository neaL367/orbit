const STORAGE_KEY = "orbit.trailer.volume"

function clampVolume(n: number) {
  return Math.round(Math.min(100, Math.max(0, n)))
}

function getSessionStorage(): Storage | null {
  if (typeof globalThis === "undefined") return null
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

/** Last trailer volume (0–100) for this tab; used on next trailer session. */
export function readTrailerVolumePreference(): number | null {
  const storage = getSessionStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw == null) return null
    const n = Number(raw)
    if (!Number.isFinite(n)) return null
    return clampVolume(n)
  } catch {
    return null
  }
}

export function persistTrailerVolumePreference(volume: number) {
  const storage = getSessionStorage()
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, String(clampVolume(volume)))
  } catch {
    /* private mode / quota */
  }
}
