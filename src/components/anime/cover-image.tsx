"use client";

import Image from "next/image";
import { useState } from "react";

interface CoverImageProps {
  imageUrl: string;
  title: string;
}

export function CoverImage({ imageUrl, title }: CoverImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="shrink-0 w-full self-start">
      <div className="overflow-hidden aspect-[2/3] rounded-xl shadow-xl border-4 border-background w-full max-w-[250px] mx-auto">
        <Image
          src={imageUrl}
          alt={title}
          width={500}
          height={750}
          quality={90}
          priority
          sizes="(max-width: 640px) 250px, 320px"
          className={`h-full w-full object-cover rounded-xl transition-all hover:scale-105 brightness-85 duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
    </div>
  );
}