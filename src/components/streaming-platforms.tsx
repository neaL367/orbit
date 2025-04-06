"use client";

import { ExternalLink, Tv } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  "Amazon Prime": {
    color: "bg-[#00A8E1]",
    url: "https://www.amazon.com/s?k=",
  },
  "Prime Video": {
    color: "bg-[#00A8E1]",
    url: "https://www.amazon.com/s?k=",
  },
  HiDive: {
    color: "bg-[#00BAFF]",
    url: "https://www.hidive.com/search?q=",
  },
  HIDIVE: {
    color: "bg-[#00BAFF]",
    url: "https://www.hidive.com/search?q=",
  },
  "Bilibili TV": {
    color: "bg-[#00A1D6]",
    url: "https://www.bilibili.tv/en/search?keyword=",
  },
  Bilibili: {
    color: "bg-[#00A1D6]",
    url: "https://www.bilibili.tv/en/search?keyword=",
  },
  "Disney+": {
    color: "bg-[#113CCF]",
    url: "https://www.disneyplus.com/search?q=",
  },
  Disney: {
    color: "bg-[#113CCF]",
    url: "https://www.disneyplus.com/search?q=",
  },
  "HBO Max": {
    color: "bg-[#5822B4]",
    url: "https://www.hbomax.com/search?q=",
  },
  VRV: {
    color: "bg-[#FFD83D]",
    url: "https://vrv.co/search?q=",
  },
  "Ani-One": {
    color: "bg-[#23A7DE]",
    url: "https://www.youtube.com/c/AniOneAsia/search?query=",
  },
  "Muse Asia": {
    color: "bg-[#FFD200]",
    url: "https://www.youtube.com/c/MuseAsia/search?query=",
  },
  YouTube: {
    color: "bg-[#FF0000]",
    url: "https://www.youtube.com/results?search_query=",
  },
  "Tencent Video": {
    color: "bg-[#FF0000]",
    url: "https://v.qq.com/x/search/?q=",
  },
  iQ: {
    color: "bg-[#1CC749]",
    url: "https://www.iq.com/search?query=",
  },
  iQIYI: {
    color: "bg-[#1CC749]",
    url: "https://www.iq.com/search?query=",
  },
  WeTV: {
    color: "bg-[#191919]",
    url: "https://wetv.vip/search?keyword=",
  },
  Viu: {
    color: "bg-[#7F45D3]",
    url: "https://www.viu.com/ott/search?keyword=",
  },
  Wakanim: {
    color: "bg-[#E63C3C]",
    url: "https://www.wakanim.tv/search?query=",
  },
  ADN: {
    color: "bg-[#0096FA]",
    url: "https://animedigitalnetwork.fr/video/recherche?q=",
  },
  "Anime Digital Network": {
    color: "bg-[#0096FA]",
    url: "https://animedigitalnetwork.fr/video/recherche?q=",
  },
  "Anime on Demand": {
    color: "bg-[#3399FF]",
    url: "https://www.anime-on-demand.de/search?q=",
  },
  "Anime Planet": {
    color: "bg-[#FF5757]",
    url: "https://www.anime-planet.com/anime/all?name=",
  },
  "Anime Lab": {
    color: "bg-[#36393F]",
    url: "https://www.animelab.com/search?query=",
  },
};

// Update the isStreamingPlatform function to include more keywords
const isStreamingPlatform = (site: string): boolean => {
  // Check if the site is in our known platforms
  if (site in STREAMING_PLATFORMS) return true;

  // Check for partial matches
  const streamingKeywords = [
    "crunchyroll",
    "funimation",
    "netflix",
    "hulu",
    "amazon",
    "prime",
    "hidive",
    "bilibili",
    "disney",
    "hbo",
    "vrv",
    "ani-one",
    "muse",
    "youtube",
    "tencent",
    "iq",
    "iqiyi",
    "wetv",
    "viu",
    "wakanim",
    "adn",
    "anime digital",
    "anime on demand",
    "anime planet",
    "anime lab",
  ];

  const siteLower = site.toLowerCase();
  return streamingKeywords.some((keyword) => siteLower.includes(keyword));
};

interface ExternalLinkType {
  id: number;
  url: string;
  site: string;
  type?: string;
  language?: string;
  color?: string;
  icon?: string;
}

interface StreamingPlatformsProps {
  animeId: number;
  title: string;
  externalLinks?: ExternalLinkType[];
}

// Update the StreamingPlatforms component to handle colors better
export function StreamingPlatforms({
  title,
  externalLinks = [],
}: StreamingPlatformsProps) {
  // Filter external links to only include streaming platforms
  const streamingLinks = externalLinks.filter(
    (link) => link.type === "STREAMING" || isStreamingPlatform(link.site)
  );

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <Tv className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="flex gap-1">
        <TooltipProvider>
          {streamingLinks.length > 0
            ? // Display actual streaming links
              streamingLinks.slice(0, 3).map((link) => {
                // Get platform name
                const platformName = link.site;

                // Find if this is a known platform
                const knownPlatform = Object.entries(STREAMING_PLATFORMS).find(
                  ([name]) =>
                    name === platformName || platformName.includes(name)
                );

                // Determine the background color class
                let bgColorClass = "bg-gray-600"; // Default fallback color

                if (knownPlatform) {
                  // Use color from our predefined list
                  bgColorClass = knownPlatform[1].color;
                } else if (link.color) {
                  // If the API provides a color and it's a valid hex, use it
                  // Remove the # if present and check if it's a valid hex color
                  const colorHex = link.color.startsWith("#")
                    ? link.color.substring(1)
                    : link.color;
                  if (/^[0-9A-F]{6}$/i.test(colorHex)) {
                    bgColorClass = `bg-[#${colorHex}]`;
                  }
                }

                return (
                  <Tooltip key={link.id}>
                    <TooltipTrigger asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center w-5 h-5 rounded-full ${bgColorClass} hover:opacity-80 transition-opacity`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-white text-[8px] font-bold">
                          {platformName.charAt(0)}
                        </span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Watch on {platformName}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            : null}

          {/* Always show the "Find more" button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`https://www.google.com/search?q=watch+${encodeURIComponent(
                  title
                )}+online`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-primary to-purple-400 hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
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
