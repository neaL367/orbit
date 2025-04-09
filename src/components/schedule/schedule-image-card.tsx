import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useState } from "react";
import { CountdownTimer } from "../countdown-timer";

interface AnimeImageCardProps {
  animeId: number;
  coverImage: { large: string; medium?: string };
  title: string;
  airingAt: number;
  isAiringToday: boolean;
  duration?: number; // Added duration parameter
}

export function ScheduleImageCard({
  animeId,
  coverImage,
  title,
  airingAt,
  duration,
}: AnimeImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate the current status to determine background color
  const now = Date.now() / 1000;
  const endTime = airingAt + (duration || 24) * 60; // End time based on duration or default 24 minutes
  const isLive = now >= airingAt && now < endTime;
  const isFinished = now >= endTime;
  // Determine tag background color based on status
  const getTagClass = () => {
    if (isLive) {
      return "bg-red-600 text-white";
    } else if (isFinished) {
      return "bg-gray-700 text-gray-300";
    } else {
      return "bg-primary-foreground text-primary";
    }
  };

  return (
    <div className="relative flex-shrink-0 w-26 md:w-34 h-36 md:h-44 overflow-hidden group rounded-l-lg">
      <Image
        src={coverImage.large || coverImage.medium || ""}
        alt={title}
        fill
        priority
        sizes="(min-width: 808px) 50vw, 100vw"
        className={`object-cover transition-all hover:scale-110 brightness-85 duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
      />
      <Link
        href={`/anime/${animeId}/${slugify(title)}`}
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Play className="w-8 h-8 text-white" />
      </Link>
      <div
        className={`absolute top-3 left-0 ${getTagClass()} text-xs font-medium py-0.5 px-2 rounded-r-full`}
      >
        <CountdownTimer targetTime={airingAt} duration={duration} />
      </div>
    </div>
  );
}

