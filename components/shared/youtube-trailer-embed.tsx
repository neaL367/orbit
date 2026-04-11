"use client"

import { useCallback, useId, useMemo, useState } from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildYouTubeNoCookieEmbedSrc } from "@/lib/utils/youtube-nocookie"

type YouTubeTrailerEmbedProps = {
  videoId: string
  title?: string
  thumbnail?: string | null
}

/**
 * Lightweight trailer: poster + launch, then youtube-nocookie iframe (native controls, max quality YouTube allows for size/bandwidth).
 * Muted autoplay after launch satisfies browser autoplay policies; user can unmute in the player.
 */
export function YouTubeTrailerEmbed({ videoId, title, thumbnail }: YouTubeTrailerEmbedProps) {
  const [active, setActive] = useState(false)
  const labelId = useId()
  const iframeTitle = title ? `Trailer: ${title}` : "YouTube trailer"

  const embedSrc = useMemo(
    () => (active ? buildYouTubeNoCookieEmbedSrc(videoId, { autoplay: true, muteForAutoplay: true }) : ""),
    [active, videoId]
  )

  const activate = useCallback(() => setActive(true), [])

  if (!videoId) return null

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-sm border border-white/10 bg-black shadow-xl",
          !active && "group/poster"
        )}
      >
        {!active ? (
          <button
            type="button"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/35 transition-colors hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={activate}
            aria-labelledby={labelId}
          >
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element -- external CDN thumb; avoids Next remote config
              <img
                src={thumbnail}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-50 transition-opacity duration-500 group-hover/poster:opacity-70"
              />
            ) : null}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/50" aria-hidden />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-sm transition-transform group-hover/poster:scale-105">
              <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
            </span>
            <span id={labelId} className="relative font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
              Play trailer
            </span>
            <span className="relative max-w-xs px-6 text-center font-mono text-[9px] uppercase leading-relaxed tracking-wider text-white/45">
              Opens in embedded player · unmute in player if needed
            </span>
          </button>
        ) : (
          <iframe
            title={iframeTitle}
            src={embedSrc}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
          />
        )}
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Streamed via YouTube — quality depends on your connection and player size.
      </p>
    </div>
  )
}
