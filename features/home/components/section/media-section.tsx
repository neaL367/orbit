"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Route } from 'next'
import { cn } from '@/lib/utils'
import { IndexSectionHeader } from '@/components/shared/index-section-header'
import { PosterCard } from '@/features/anime/components/poster-card'
import type { Media } from '@/lib/graphql/types/graphql'

interface MediaSectionProps {
  data: Media[]
  title: string
  subtitle?: string
  variant?: 'grid' | 'list' | 'featured'
  viewAllHref?: string
  showRank?: boolean
  className?: string
}

/**
 * Unified Media Section component.
 * Combines Grid, List, and Featured views into a single, high-performance architecture.
 */
export function MediaSection({ 
  data, 
  title, 
  subtitle, 
  variant = 'grid', 
  viewAllHref, 
  showRank = false,
  className 
}: MediaSectionProps) {
  
  if (!data?.length) return null

  return (
    <section className={cn("mb-32 group/section reveal relative", className)}>
      {/* Universal Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10 mb-12 border-b border-white/10 pb-8">
        <IndexSectionHeader
          title={title}
          subtitle={subtitle || (variant === 'featured' ? "Featured_Archive" : "General_Archive")}
          className="flex-1 mb-0"
        />

        {viewAllHref && (
          <Link
            href={viewAllHref as Route}
            className="group/btn relative inline-flex items-center gap-4 px-8 py-3 bg-foreground text-background font-mono text-xs font-black uppercase tracking-[0.3em] transition-all hover:bg-primary hover:text-primary-foreground index-cut-tr shadow-[4px_4px_0_0_rgba(255,255,255,0.05)] hover:shadow-[6px_6px_0_0_rgba(var(--primary),0.2)]"
          >
            ACCESS_REGISTRY
            <div className="w-1.5 h-1.5 bg-current rotate-45 transform group-hover/btn:translate-x-1.5 transition-all" />
          </Link>
        )}
      </div>

      {/* Layout Variants */}
      {variant === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
          {data.map((anime, index) => (
            <PosterCard
              key={anime.id}
              anime={anime}
              rank={showRank ? index + 1 : undefined}
              priority={index < 2}
            />
          ))}
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-4 relative">
          {data.slice(0, 5).map((anime, index) => (
            <ListItem key={anime.id} anime={anime} index={index} />
          ))}
        </div>
      )}

      {variant === 'featured' && (
        <FeaturedLayout featured={data[0]} secondaries={data.slice(1, 5)} />
      )}

      {/* Global Decorative Brackets */}
      <div className="absolute -top-6 -left-2 w-4 h-4 border-t border-l border-white/20 pointer-events-none" />
      <div className="absolute -top-6 -right-2 w-4 h-4 border-t border-r border-white/20 pointer-events-none" />
    </section>
  )
}

/**
 * Internal List Item Component
 */
function ListItem({ anime, index }: { anime: Media; index: number }) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group/list flex items-center gap-4 sm:gap-10 p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 transition-all duration-300 relative overflow-hidden index-cut-tr hover:shadow-[0_0_20px_rgba(var(--primary),0.05)]"
    >
      <div className="font-mono text-2xl sm:text-4xl font-black text-white/10 group-hover/list:text-primary/30 transition-colors w-12 sm:w-16 text-center shrink-0 tracking-tighter tabular-nums">
        {(index + 1).toString().padStart(2, '0')}
      </div>

      <div className="w-14 h-20 sm:w-20 sm:h-28 border border-white/15 overflow-hidden shrink-0 relative bg-black">
        <Image
          src={anime.coverImage?.large || anime.coverImage?.medium || ''}
          alt={anime.title?.romaji || ''}
          fill
          sizes="100px"
          className="w-full h-full object-cover grayscale brightness-75 group-hover/list:grayscale-0 group-hover/list:brightness-100 group-hover/list:scale-105 transition-all duration-500 ease-out"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <h3 className="font-sans text-[15px] sm:text-lg lg:text-xl font-bold uppercase tracking-tight truncate group-hover/list:text-primary transition-colors text-foreground/90">
            {anime.title?.userPreferred || anime.title?.romaji}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {anime.genres?.slice(0, 2).map(g => (
              <span key={g} className="font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black/40 text-muted-foreground/80 border border-white/10 group-hover/list:border-primary/30 transition-colors">{g}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8 sm:gap-12 shrink-0 border-l border-white/10 sm:pl-10 h-12">
          <div className="flex flex-col items-end gap-1 font-mono">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.3em] font-bold">FORMAT</span>
            <span className="text-xs text-foreground font-black group-hover/list:text-primary transition-colors">{anime.format || '??'}</span>
          </div>
          <div className="flex flex-col items-end gap-1 font-mono">
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.3em] font-bold">SCORE</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground font-black tracking-widest">{anime.averageScore ? `${anime.averageScore}%` : '---'}</span>
              <div className={cn("w-2 h-2 rotate-45 transition-colors duration-300", anime.averageScore && anime.averageScore > 75 ? "bg-primary animate-pulse" : "bg-white/20 group-hover/list:bg-primary/50")} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/list:opacity-100 transition-opacity">
        <span className="font-mono text-[10px] text-primary font-bold">0x{anime.id}</span>
      </div>
    </Link>
  )
}

/**
 * Internal Featured Layout Component
 */
function FeaturedLayout({ featured, secondaries }: { featured: Media; secondaries: Media[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      <div className="lg:col-span-7">
        <div className="relative group/feat overflow-hidden border border-white/10 bg-secondary/5 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]">
          <div className="aspect-[16/9] w-full overflow-hidden relative bg-black">
            <Image
              src={featured.bannerImage || featured.coverImage?.extraLarge || ''}
              alt={featured.title?.romaji || ''}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
              className="w-full h-full object-cover grayscale brightness-75 opacity-90 group-hover/feat:grayscale-0 group-hover/feat:scale-105 group-hover/feat:opacity-100 transition-all duration-[1s] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-1.5 font-mono">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 backdrop-blur-md">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Registry_Pulse</span>
            </div>
            <span className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold">ARC-0x{featured.id}</span>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 z-10">
            <div className="space-y-6 max-w-2xl transform translate-y-2 group-hover/feat:translate-y-0 transition-transform duration-500 ease-out">
              <h3 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold uppercase leading-[1.05] tracking-tight text-foreground/90 group-hover/feat:text-white transition-colors duration-500 line-clamp-2 drop-shadow-2xl">
                {featured.title?.userPreferred || featured.title?.romaji}
              </h3>
              {featured.description && (
                <p className="text-muted-foreground/70 font-mono text-[11px] leading-relaxed line-clamp-2 uppercase tracking-wider max-w-xl border-l-[3px] border-primary/50 pl-5 py-1 bg-black/40 backdrop-blur-sm">
                  {featured.description.replace(/<[^>]*>?/gm, '')}
                </p>
              )}
              <div className="pt-4">
                <Link
                  href={`/anime/${featured.id}`}
                  className="group/btn relative inline-flex items-center gap-4 px-10 py-4 bg-foreground text-background font-mono text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-primary hover:text-primary-foreground index-cut-tr shadow-lg"
                >
                  Access_Archive
                  <div className="w-1.5 h-1.5 bg-current rotate-45 transform group-hover/btn:translate-x-1 group-hover/btn:scale-125 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-8">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border-l-2 border-primary/50 self-start">
          <span className="font-mono text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">Secondary_Nodes [0x04]</span>
        </div>
        <div className="grid grid-cols-2 gap-6 content-start">
          {secondaries.map((anime) => (
            <PosterCard key={anime.id} anime={anime} className="w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
