"use client";

import Image from "next/image";
import { useState } from "react";

interface BannerImageProps {
  bannerImage?: string;
  title: string;
}

export function BannerImage({ bannerImage, title }: BannerImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!bannerImage) {
    return (
      <div className="relative w-full h-[200px] sm:h-[400px] rounded-t-xl bg-primary/20">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[200px] sm:h-[450px] rounded-xl overflow-hidden">
      <Image
        src={bannerImage}
        alt={title || ""}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover brightness-85 transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        priority
        onLoad={() => setImageLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  );
}