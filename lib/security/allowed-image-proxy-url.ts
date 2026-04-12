/**
 * Hostnames permitted for /api/image-proxy (defense against open SSRF).
 * Keep in sync with next.config `images.remotePatterns` for AniList assets.
 */
const ALLOWED_IMAGE_HOSTS = new Set([
  's4.anilist.co',
  's2.anilist.co',
  'img.anilist.co',
])

/**
 * @throws Error if the URL is not a safe https image origin
 */
export function assertAllowedImageProxyUrl(urlString: string): URL {
  let parsed: URL
  try {
    parsed = new URL(urlString)
  } catch {
    throw new Error('Invalid URL')
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Only https URLs are allowed')
  }
  if (!ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) {
    throw new Error('Host not allowed')
  }
  return parsed
}
