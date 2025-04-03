import { Card, CardContent } from "@/components/ui/card";
import { fetchAnimeCharacters } from "@/lib/api";
import type { Character } from "@/lib/types";
import Image from "next/image";

export async function AnimeCharacters({ id }: { id: string }) {
  const characters = await fetchAnimeCharacters(id);

  if (characters.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No character information available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {characters.map((character: Character) => (
        <Card key={character.id} className="overflow-hidden">
          <div className="aspect-square w-full overflow-hidden">
            <Image
              src={character.image.large || ""}
              alt={character.name.full}
              className="h-full w-full object-cover"
              width={300}
              height={450}
            />
          </div>
          <CardContent className="p-3">
            <h3 className="line-clamp-1 font-medium">{character.name.full}</h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {character.role}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
