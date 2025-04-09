import { ExternalLink } from "lucide-react";
import { AnimeMedia } from "@/lib/types";

interface ExternalLinksProps {
  anime: AnimeMedia;
}

export function ExternalLinks({ anime }: ExternalLinksProps) {
  if (!anime.externalLinks || anime.externalLinks.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border p-4 bg-card/80 backdrop-blur-sm shadow-sm">
      <h3 className="font-semibold text-sm mb-3">External Links</h3>
      <div className="flex flex-wrap gap-2">
        {anime.externalLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {link.site} <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        ))}
      </div>
    </div>
  );
}