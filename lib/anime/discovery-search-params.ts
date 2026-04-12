import type { Route } from 'next'

/**
 * Serializes discovery URL state for redirects (server) and tests.
 */
export function discoverySearchParamsToURLSearchParams(
  raw: Record<string, string | string[] | undefined>
): URLSearchParams {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) qs.append(key, item)
      }
    } else if (value) {
      qs.set(key, value)
    }
  }
  return qs
}

export function withDefaultDiscoverySort(
  raw: Record<string, string | string[] | undefined>
): Route {
  const qs = discoverySearchParamsToURLSearchParams(raw)
  if (!qs.get('sort')) {
    qs.set('sort', 'trending')
  }
  return `/anime?${qs.toString()}` as Route
}
