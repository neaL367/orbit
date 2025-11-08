'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import type { Media } from "@/graphql/graphql"
import type { Route } from "next"

type TrailerProps = {
  trailer: Media["trailer"]
  title: string
}

// Get YouTube thumbnail URL with fallback
function getYouTubeThumbnail(videoId: string): string {
  // Try maxresdefault first, fallback to hqdefault if not available
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
}

// Lite YouTube Embed Component
function LiteYouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&hd=1&vq=hd1080&modestbranding=1&autoplay=1`

  const thumbnailUrl = getYouTubeThumbnail(videoId)
  
  // Fallback to hqdefault if maxresdefault fails to load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget
    if (!target.src.includes('hqdefault')) {
      target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    }
  }

  const handleClick = () => {
    setIsLoaded(true)
  }

  // Cleanup: Stop video playback on unmount
  useEffect(() => {
    // Capture current iframe reference
    const currentIframe = iframeRef.current
    
    return () => {
      // When component unmounts, stop the video
      if (currentIframe) {
        // Clear iframe src to stop playback
        currentIframe.src = ''
        // Try to remove iframe from DOM if it still exists
        try {
          currentIframe.remove()
        } catch {
          // If already removed, ignore error
        }
      }
    }
  }, [isLoaded]) // Cleanup when video is loaded/unloaded

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl">
      {!isLoaded ? (
        <button
          onClick={handleClick}
          className="relative w-full h-full group cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded-2xl"
          aria-label={`Play ${title} trailer`}
        >
          {/* Thumbnail Image */}
          <div className="absolute inset-0">
            <img
              src={thumbnailUrl}
              alt={`${title} trailer thumbnail`}
              loading="lazy"
              decoding="async"
              fetchPriority="auto"
              className="absolute inset-0 w-full h-full object-cover"
              onError={handleImageError}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
          </div>

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-2xl bg-[#FF0000] bg-opacity-90 group-hover:bg-opacity-100">
              <svg 
                className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* YouTube Logo Badge */}
          <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 group-hover:bg-black/85 transition-colors">
            <svg 
              className="w-5 h-5 text-white" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="text-xs font-medium text-white">YouTube</span>
          </div>
        </button>
      ) : (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={`${title} trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      )}
    </div>
  )
}

export function Trailer({ trailer, title }: TrailerProps) {
  const pathname = usePathname()
  
  if (!trailer || !trailer.id) return null

  if (trailer.site === "youtube") {
    return (
      <div className="mt-16 space-y-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Trailer</h2>
          <p className="text-zinc-400 text-sm md:text-base">Watch the official trailer</p>
        </div>
        <LiteYouTubeEmbed key={pathname} videoId={trailer.id} title={title} />
      </div>
    )
  }

  const trailerUrl = trailer.site === "dailymotion" ? `https://www.dailymotion.com/video/${trailer.id}` : null

  if (!trailerUrl) return null

  return (
    <div className="mt-16 space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Trailer</h2>
        <p className="text-zinc-400 text-sm md:text-base">Watch the official trailer</p>
      </div>
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl group">
        {trailer.thumbnail ? (
          <Link
            href={trailerUrl as Route}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative w-full h-full"
          >
            <div className="absolute inset-0 bg-zinc-800" />
            <img
              src={trailer.thumbnail}
              alt={`${title} trailer`}
              loading="lazy"
              decoding="async"
              fetchPriority="auto"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </Link>
        ) : (
          <a
            href={trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 transition-colors duration-300"
          >
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
              <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </a>
        )}
      </div>
    </div>
  )
}
