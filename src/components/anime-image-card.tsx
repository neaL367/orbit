import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import { slugify } from "@/lib/utils";
interface AnimeImageCardProps {
  animeId: number;
  coverImage: { large: string; medium?: string };
  title: string;
  airingAt: number;
  isAiringToday: boolean;
}

export function AnimeImageCard({
  animeId,
  coverImage,
  title,
  airingAt,
}: AnimeImageCardProps) {
  return (
    <div className="relative flex-shrink-0 w-26 md:w-34 h-36 md:h-44 overflow-hidden group rounded-l-lg">
      <Image
        src={coverImage.large || coverImage.medium || ""}
        alt={title}
        fill
        className="object-cover group-hover:scale-105 transition-all duration-300 brightness-90"
        priority
        sizes="(min-width: 808px) 50vw, 100vw"
      />
      <Link
        href={`/anime/${animeId}/${slugify(title)}`}
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Play className="w-8 h-8 text-white" />
      </Link>
      <div className="absolute top-3 left-0 bg-primary-foreground text-primary text-xs font-medium py-0.5 px-2 rounded-r-full">
        <CountdownTimer targetTime={airingAt} />
      </div>
    </div>
  );
}
