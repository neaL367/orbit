import { ExternalLink } from "@/lib/anilist/utils/types"
import { Link } from "lucide-react"

export function AnimeExternalLinks({ links }: { links: ExternalLink[] }) {
  return (
    <div className="mt-6 flex flex-col gap-2.5 items-center md:items-start p-4 bg-card rounded-lg border border-border shadow-sm">
      <h3 className="mb-2 font-semibold text-sm bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
        External Links
      </h3>
      <div className="flex flex-wrap justify-center md:justify-start gap-3">
        {links.slice(0, 4).map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-muted rounded-full hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 transition-all"
          >
            {link.site} <Link className="h-3 w-3 ml-1" />
          </a>
        ))}
      </div>
    </div>
  )
}

