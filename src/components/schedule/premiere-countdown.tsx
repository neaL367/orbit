import { format } from "date-fns";
import { Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScheduleMetadata } from "@/app/(pages)/schedule/page";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface PremiereCountdownProps {
  premieres: ScheduleMetadata[];
  currentPremiereIndex: number;
  setCurrentPremiereIndex: (index: number) => void;
  currentPremiere: ScheduleMetadata;
  timeRemaining: TimeRemaining;
}

export function PremiereCountdown({
  premieres,
  currentPremiereIndex,
  setCurrentPremiereIndex,
  currentPremiere,
  timeRemaining,
}: PremiereCountdownProps) {
  if (premieres.length === 0) return null;

  const title =
    currentPremiere.media.title.english ||
    currentPremiere.media.title.romaji ||
    "Unknown Anime";

  return (
    <div className="mb-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl overflow-hidden">
      <div className="relative overflow-hidden rounded-xl bg-black/5 backdrop-blur-sm">
        {/* Background image with blur effect */}
        <div
          className="absolute inset-0 opacity-20 blur-sm"
          style={{
            backgroundImage: `url(${
              currentPremiere.media.bannerImage ||
              currentPremiere.media.coverImage.large
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col items-center md:gap-8">
          <div className="flex-1 text-center">
            {/* Premiere badge */}
            <div className="inline-flex mb-4">
              <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full flex gap-2">
                <Star className="h-3 w-3 text-yellow-400" />
                <span className="uppercase tracking-wide text-[10px]">
                  Upcoming Premiere
                </span>
              </div>
            </div>
            
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3">
              {title}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
              {currentPremiere.media.genres?.slice(0, 3).map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="rounded-full"
                >
                  {genre}
                </Badge>
              ))}
              {currentPremiere.media.episodes && (
                <Badge variant="outline" className="rounded-full">
                  {currentPremiere.media.episodes} episodes
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center  ">
              <Clock className="h-3 w-3" />
              <span>
                {format(new Date(currentPremiere.airingAt * 1000), "PPP")}
              </span>
            </div>
          </div>

          <div className="relative mt-6 md:mt-0">
            <div className="absolute -inset-1 bg-gradient-to-br from-zinc-300/20 to-zinc-300/20 rounded-xl blur-sm" />
            <div className="relative bg-black/30 backdrop-blur-md rounded-lg p-4 sm:p-5">
              <p className="text-xs uppercase tracking-wider mb-3 opacity-70 text-center">
                Premieres in
              </p>
              <div className="flex gap-6 sm:gap-8 md:gap-10 justify-between">
                {[
                  { value: timeRemaining.days, label: "Days" },
                  { value: timeRemaining.hours, label: "Hours" },
                  { value: timeRemaining.minutes, label: "Mins" },
                  { value: timeRemaining.seconds, label: "Secs" },
                ].map((time, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xl sm:text-2xl md:text-3xl font-mono font-bold">
                      {time.value.toString().padStart(2, "0")}
                    </p>
                    <p className="text-xs sm:text-sm opacity-70">{time.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {premieres.length > 1 && (
          <div 
            className="flex justify-center py-4 gap-2" 
            role="tablist"
            aria-label="Premiere navigation"
          >
            {premieres.map((premiere, index) => (
              <button
                key={premiere.id || index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentPremiereIndex
                    ? "bg-white/90 w-8 sm:w-10"
                    : "bg-white/30 w-4 sm:w-5 hover:bg-white/50"
                }`}
                onClick={() => {
                  setCurrentPremiereIndex(index);
                }}
                aria-label={`View premiere ${index + 1}`}
                aria-selected={index === currentPremiereIndex}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



