import Image from "next/image"

export function AnimeBanner({ image, title }: { image: string; title: string }) {
  return (
    <div className="relative w-full h-[150px] sm:h-[200px] overflow-hidden mb-12">
      <Image
        src={image || ""}
        alt={title}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  )
}

