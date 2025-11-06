"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Media } from "@/graphql/graphql"
import type { Route } from "next"

type AnimeDetailTrailerProps = {
  trailer: Media["trailer"]
  title: string
}

export function AnimeDetailTrailer({ trailer, title }: AnimeDetailTrailerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  if (!trailer || !trailer.id) return null

  if (trailer.site === "youtube") {
    const embedUrl = `https://www.youtube.com/embed/${trailer.id}?autoplay=0&rel=0&hd=1&vq=hd1080&modestbranding=1`

    return (
      <div className="mt-16 space-y-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Trailer</h2>
          <p className="text-zinc-400 text-sm md:text-base">Watch the official trailer</p>
        </div>
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl">
          <iframe
            src={embedUrl}
            title={`${title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
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
            <Image
              src={trailer.thumbnail || ""}
              alt={`${title} trailer`}
              fill
              sizes="100vw"
              onLoad={() => setIsLoaded(true)}
              className={cn(
                "object-cover w-full h-full transition-all duration-700 ease-in-out group-hover:scale-105",
                isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
              )}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
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
