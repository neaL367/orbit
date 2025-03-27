import { Trailer } from "@/anilist/utils/types";

export function AnimeTrailer({
  trailer,
  title,
}: {
  trailer: Trailer;
  title: string;
}) {
  return (
    <div className="relative mt-12 p-6 bg-card rounded-lg border border-border shadow-md">
      <h3 className="mb-6 text-xl font-semibold text-white">Trailer</h3>
      <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
        <iframe
          src={`https://www.youtube.com/embed/${trailer.id}`}
          title={`${title} Trailer`}
          allowFullScreen
          className="w-full h-full rounded-lg brightness-85"
        />
      </div>
    </div>
  );
}
