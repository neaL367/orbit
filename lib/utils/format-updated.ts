/**
 * Human-readable relative time for "last synced" style labels (client-only).
 */
export function formatRelativeUpdated(updatedAt: number, now = Date.now()): string {
  if (!updatedAt || updatedAt <= 0) return "Not yet loaded"

  const diffMs = now - updatedAt
  const diffSec = Math.round(diffMs / 1000)
  if (diffSec < 5) return "Just now"
  if (diffSec < 60) return `${diffSec}s ago`

  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 48) return `${diffHr}h ago`

  const diffDay = Math.round(diffHr / 24)
  return `${diffDay}d ago`
}
