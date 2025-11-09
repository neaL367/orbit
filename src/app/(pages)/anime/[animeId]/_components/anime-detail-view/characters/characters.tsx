"use client"

import { useState, useMemo, memo, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { Media } from "@/lib/graphql/types/graphql"

type CharacterEdge = NonNullable<NonNullable<Media["characters"]>["edges"]>[number]

type CharactersProps = {
  characters: Array<CharacterEdge | null>
}

type CharacterItemProps = {
  edge: NonNullable<CharacterEdge>
  loadedImages: Set<number>
  onImageLoad: (id: number) => void
}

function CharacterItemComponent({ edge, loadedImages, onImageLoad }: CharacterItemProps) {
  const character = edge.node

  // Extract only necessary data
  const characterData = useMemo(() => {
    const characterName = character?.name?.full || character?.name?.native || "Unknown"
    const characterImage = character?.image?.large || character?.image?.medium
    return {
      id: character?.id ?? 0,
      name: characterName,
      image: characterImage,
      imageMedium: character?.image?.medium,
      imageLarge: character?.image?.large,
    }
  }, [character])

  const vaData = useMemo(() => {
    const voiceActors = edge.voiceActors?.filter(Boolean) || []
    return voiceActors.slice(0, 1).map((va) => {
      if (!va) return null
      return {
        id: va.id,
        name: va.name?.full || va.name?.native || "Unknown",
        image: va.image?.large || va.image?.medium,
      }
    }).filter(Boolean)[0] || null
  }, [edge.voiceActors])

  return (
    <div className="group">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-xl ring-1 ring-zinc-800/50 group-hover:ring-zinc-700/50 transition-all duration-200">
        <div
          className="absolute inset-0 bg-zinc-800 transition-opacity duration-500"
          style={{ opacity: loadedImages.has(characterData.id) ? 0 : 1 }}
        />
        {characterData.image ? (
          <img
            src={characterData.image}
            srcSet={characterData.imageMedium && characterData.imageLarge 
              ? `${characterData.imageMedium} 150w, ${characterData.imageLarge} 250w` 
              : undefined}
            sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 200px"
            alt={characterData.name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            referrerPolicy="no-referrer"
            onLoad={() => onImageLoad(characterData.id)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-500",
              loadedImages.has(characterData.id) ? "opacity-100 scale-100" : "opacity-0 scale-105",
              "group-hover:scale-110"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="space-y-2 flex flex-col items-center text-center">
        <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight">{characterData.name}</p>
        {edge.role && (
          <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50">
            {edge.role}
          </p>
        )}
        {vaData && (
          <div className="pt-1.5 w-full">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs justify-center">
              {vaData.image ? (
                <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden shrink-0 ring-1 ring-zinc-700/50">
                  <div className="absolute inset-0 bg-zinc-700 transition-opacity duration-300" style={{ opacity: loadedImages.has(vaData.id) ? 0 : 1 }} />
                  <img
                    src={vaData.image}
                    alt={vaData.name}
                    width={28}
                    height={28}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    referrerPolicy="no-referrer"
                    onLoad={() => onImageLoad(vaData.id)}
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-300",
                      loadedImages.has(vaData.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-700 shrink-0" />
              )}
              <p className="text-zinc-400 line-clamp-1 font-medium">{vaData.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CharacterItem = memo(CharacterItemComponent, (prevProps, nextProps) => {
  const prevEdge = prevProps.edge
  const nextEdge = nextProps.edge
  
  // Compare character ID
  if (prevEdge.node?.id !== nextEdge.node?.id) return false
  
  // Compare character name
  const prevName = prevEdge.node?.name?.full || prevEdge.node?.name?.native
  const nextName = nextEdge.node?.name?.full || nextEdge.node?.name?.native
  if (prevName !== nextName) return false
  
  // Compare character image
  const prevCharImage = prevEdge.node?.image?.large || prevEdge.node?.image?.medium
  const nextCharImage = nextEdge.node?.image?.large || nextEdge.node?.image?.medium
  if (prevCharImage !== nextCharImage) return false
  
  // Compare role
  if (prevEdge.role !== nextEdge.role) return false
  
  // Compare voice actors (first one only)
  const prevVA = prevEdge.voiceActors?.[0]
  const nextVA = nextEdge.voiceActors?.[0]
  if (prevVA?.id !== nextVA?.id) return false
  const prevVAName = prevVA?.name?.full || prevVA?.name?.native
  const nextVAName = nextVA?.name?.full || nextVA?.name?.native
  if (prevVAName !== nextVAName) return false
  const prevVAImage = prevVA?.image?.large || prevVA?.image?.medium
  const nextVAImage = nextVA?.image?.large || nextVA?.image?.medium
  if (prevVAImage !== nextVAImage) return false
  
  // Compare function and Set references
  if (prevProps.onImageLoad !== nextProps.onImageLoad) return false
  if (prevProps.loadedImages !== nextProps.loadedImages) return false
  
  return true
})

export function Characters({ characters }: CharactersProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  
  const handleImageLoad = useCallback((id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id))
  }, [])
  
  // Filter valid characters, sort by role (MAIN first), then limit to 12
  const validCharacters = useMemo(() => {
    return characters
      .filter((edge): edge is NonNullable<CharacterEdge> => edge?.node !== null && edge?.node !== undefined)
      .sort((a, b) => {
        // Sort by role priority: MAIN > SUPPORTING > BACKGROUND
        const rolePriority: Record<string, number> = {
          MAIN: 0,
          SUPPORTING: 1,
          BACKGROUND: 2,
        }
        const aPriority = a?.role ? rolePriority[a.role] ?? 3 : 3
        const bPriority = b?.role ? rolePriority[b.role] ?? 3 : 3
        return aPriority - bPriority
      })
      .slice(0, 12)
  }, [characters])

  if (validCharacters.length === 0) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Cast & Characters</h2>
        <p className="text-sm text-zinc-400">Meet the characters bringing this story to life</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
        {validCharacters.map((edge) => (
          <CharacterItem
            key={edge.node?.id}
            edge={edge}
            loadedImages={loadedImages}
            onImageLoad={handleImageLoad}
          />
        ))}
      </div>
    </div>
  )
}

