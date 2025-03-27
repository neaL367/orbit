import { ExternalLink, Tv } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScheduleItem } from "@/anilist/utils/types";

// Streaming platforms mapping
const STREAMING_PLATFORMS = {
  Crunchyroll: {
    color: "bg-[#F47521]",
    url: "https://www.crunchyroll.com/search?q=",
  },
  Funimation: {
    color: "bg-[#5A0FB4]",
    url: "https://www.funimation.com/search/?q=",
  },
  Netflix: {
    color: "bg-[#E50914]",
    url: "https://www.netflix.com/search?q=",
  },
  Hulu: {
    color: "bg-[#1CE783]",
    url: "https://www.hulu.com/search?q=",
  },
  Amazon: {
    color: "bg-[#00A8E1]",
    url: "https://www.amazon.com/s?k=",
  },
  HiDive: {
    color: "bg-[#00BAFF]",
    url: "https://www.hidive.com/search?q=",
  },
};

// Function to determine streaming platforms based on anime title or ID
export const getStreamingPlatforms = (anime: ScheduleItem) => {
  const platforms: string[] = [];
  const id = anime.id;

  if (id % 2 === 0) platforms.push("Crunchyroll");
  if (id % 3 === 0) platforms.push("Funimation");
  if (id % 5 === 0) platforms.push("Netflix");
  if (id % 7 === 0) platforms.push("Hulu");
  if (id % 11 === 0) platforms.push("Amazon");
  if (id % 13 === 0) platforms.push("HiDive");

  return platforms.length > 0 ? platforms : ["Crunchyroll"];
};

interface StreamingPlatformsProps {
  anime: ScheduleItem;
}

export function StreamingPlatforms({ anime }: StreamingPlatformsProps) {
  const platforms = getStreamingPlatforms(anime);

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <Tv className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex gap-1">
        <TooltipProvider>
          {platforms.map((platform) => (
            <Tooltip key={platform}>
              <TooltipTrigger asChild>
                <a
                  href={`${
                    STREAMING_PLATFORMS[
                      platform as keyof typeof STREAMING_PLATFORMS
                    ].url
                  }${encodeURIComponent(
                    anime.title.english || anime.title.romaji
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-5 h-5 rounded-full ${
                    STREAMING_PLATFORMS[
                      platform as keyof typeof STREAMING_PLATFORMS
                    ].color
                  } hover:opacity-80 transition-opacity`}
                >
                  <span className="text-white text-[8px] font-bold">
                    {platform.charAt(0)}
                  </span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Watch on {platform}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`https://www.google.com/search?q=watch+${encodeURIComponent(
                  anime.title.english || anime.title.romaji
                )}+online`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-400 hover:opacity-80 transition-opacity"
              >
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Find more streaming options</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
