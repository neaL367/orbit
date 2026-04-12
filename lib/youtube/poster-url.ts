/** Official YouTube still URLs (no API key). Maxres may 404 for short / low-res uploads. */
export function youTubePosterUrl(videoId: string, quality: "maxresdefault" | "hqdefault" = "maxresdefault") {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/${quality}.jpg`
}
