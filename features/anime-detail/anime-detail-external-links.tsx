"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Media } from "@/graphql/graphql"
import { ExternalLinkType } from "@/graphql/graphql"
import type { Route } from "next"

type ExternalLink = NonNullable<Media["externalLinks"]>[number]

type AnimeDetailExternalLinksProps = {
  externalLinks: Array<ExternalLink | null>
}

function ExternalLinkItem({ link }: { link: ExternalLink | null }) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  if (!link || !link.url || link.isDisabled) return null

  const siteName = link.site || "External Link"
  const linkColor = link.color || "#ffffff"
  const linkIcon = link.icon

  return (
    <Link
      href={link.url as Route}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border transition-all hover:shadow-md"
      style={{
        backgroundColor: `${linkColor}15`,
        borderColor: `${linkColor}40`,
      }}
    >
      {linkIcon ? (
        <div className="relative w-4 h-4 shrink-0">
          <Image
            src={linkIcon}
            alt={siteName}
            fill
            onLoad={() => setIsLoaded(true)}
            className={cn(
              "object-contain transition-all duration-700 ease-in-out",
              isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
            )}
            style={{ filter: `drop-shadow(0 0 2px ${linkColor}80)` }}
          />
        </div>
      ) : (
        <div
          className="w-4 h-4 rounded shrink-0"
          style={{ backgroundColor: linkColor }}
        />
      )}
      <span className="text-xs font-medium text-white">{siteName}</span>
    </Link>
  )
}

export function AnimeDetailExternalLinks({ externalLinks }: AnimeDetailExternalLinksProps) {
  const allExternalLinks = externalLinks.filter(
    (link) => link?.url && !link.isDisabled
  )

  // Group external links by type
  const streamingLinks = allExternalLinks.filter(
    (link) => link?.type === ExternalLinkType.Streaming
  ) as ExternalLink[]
  const socialLinks = allExternalLinks.filter(
    (link) => link?.type === ExternalLinkType.Social
  ) as ExternalLink[]
  const infoLinks = allExternalLinks.filter(
    (link) => link?.type === ExternalLinkType.Info
  ) as ExternalLink[]

  return (
    <>
      {/* External Links - Streaming */}
      {streamingLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">Watch Online</h3>
          <div className="flex flex-wrap gap-2">
            {streamingLinks.map((link) => (
              <ExternalLinkItem key={link?.id} link={link} />
            ))}
          </div>
        </div>
      )}

      {/* External Links - Social */}
      {socialLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">Social</h3>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <ExternalLinkItem key={link?.id} link={link} />
            ))}
          </div>
        </div>
      )}

      {/* External Links - Info */}
      {infoLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">Info</h3>
          <div className="flex flex-wrap gap-2">
            {infoLinks.map((link) => (
              <ExternalLinkItem key={link?.id} link={link} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

