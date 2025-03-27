"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";

interface Premiere {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    large: string | null;
    medium: string | null;
  };
  bannerImage: string | null;
  premiereDate: Date;
  episodes: number | string | null;
  duration: number | string | null;
}

interface CountdownBannerProps {
  premieres: Premiere[];
}

export default function ScheduleBanner({ premieres }: CountdownBannerProps) {
  const [currentPremiereIndex, setCurrentPremiereIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const currentPremiere = premieres[currentPremiereIndex];

  useEffect(() => {
    // Function to calculate time remaining
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const premiereTime = new Date(currentPremiere.premiereDate).getTime();
      const difference = premiereTime - now;

      if (difference <= 0) {
        // Move to next premiere if current one has passed
        if (currentPremiereIndex < premieres.length - 1) {
          setCurrentPremiereIndex((prev) => prev + 1);
        }
        return;
      }

      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    // Initial calculation
    calculateTimeRemaining();

    // Set up interval to update countdown
    const intervalId = setInterval(calculateTimeRemaining, 1000);

    // Clean up interval
    return () => clearInterval(intervalId);
  }, [currentPremiere, currentPremiereIndex, premieres.length]);

  // Rotate through premieres every 10 seconds if there are multiple
  useEffect(() => {
    if (premieres.length <= 1) return;

    const rotationInterval = setInterval(() => {
      setCurrentPremiereIndex((prev) => (prev + 1) % premieres.length);
    }, 10000);

    return () => clearInterval(rotationInterval);
  }, [premieres.length]);

  return (
    <Card className="w-full overflow-hidden border-0 shadow-lg">
      <div
        className="relative h-64 md:h-80 bg-cover bg-center rounded-xl"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${
            currentPremiere.bannerImage || currentPremiere.coverImage.large
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-center my-4 px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="inline-block bg-primary bg-gradient-to-r to-purple-400 text-primary-foreground px-3 py-1 rounded-md text-xs font-medium mb-4">
              UPCOMING PREMIERE
            </div>

            <h2 className="text-white text-sm md:text-2xl font-bold mb-2">
              {currentPremiere.title.english || currentPremiere.title.romaji}
            </h2>

            <div className="flex flex-wrap gap-3 mb-6 text-white/80">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm md:text-2xl ">{currentPremiere.episodes} Episodes</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm md:text-2xl ">{currentPremiere.duration} min per episode</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-3">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]">
                <div className="text-sm md:text-2xl font-bold text-white">
                  {timeRemaining.days}
                </div>
                <div className="text-[8px] text-white/70">DAYS</div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]">
                <div className="text-sm md:text-2xl font-bold text-white">
                  {timeRemaining.hours}
                </div>
                <div className="text-[8px] text-white/70">HOURS</div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]">
                <div className="text-sm md:text-2xl font-bold text-white">
                  {timeRemaining.minutes}
                </div>
                <div className="text-[8px] text-white/70">MINUTES</div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1 md:p-3 text-center min-w-[70px]">
                <div className="text-sm md:text-2xl font-bold text-white">
                  {timeRemaining.seconds}
                </div>
                <div className="text-[8px] text-white/70">SECONDS</div>
              </div>
            </div>
          </div>
        </div>

        {premieres.length > 1 && (
          <div className="absolute bottom-4 right-4 flex space-x-1">
            {premieres.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentPremiereIndex ? "bg-primary" : "bg-white/50"
                }`}
                onClick={() => setCurrentPremiereIndex(index)}
                aria-label={`View premiere ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
