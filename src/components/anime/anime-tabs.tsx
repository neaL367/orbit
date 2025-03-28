import Image from "next/image";
import { Link } from "next-view-transitions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AnimeMedia } from "@/anilist/modal/media";
import { CharacterEdge } from "@/anilist/modal/charactor";
import { Recommendation, RelationEdge } from "@/anilist/modal/relation";

export function AnimeTabs({ anime }: { anime: AnimeMedia }) {
  return (
    <Tabs defaultValue="characters" className="mt-8">
      <TabsList className="w-full mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 h-auto">
        <TabsTrigger
          value="characters"
          className="w-full text-xs sm:text-sm px-2 py-2 hover:cursor-pointer"
        >
          Characters
        </TabsTrigger>
        <TabsTrigger
          value="relations"
          className="w-full text-xs sm:text-sm px-2 py-2 hover:cursor-pointer"
        >
          Relations
        </TabsTrigger>
        <TabsTrigger
          value="recommendations"
          className="w-full text-xs sm:text-sm px-2 py-2 hover:cursor-pointer"
        >
          Recommendations
        </TabsTrigger>
      </TabsList>

      <TabsContent value="characters">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {anime.characters &&
          anime.characters.edges &&
          anime.characters.edges.length > 0 ? (
            anime.characters.edges.map((character: CharacterEdge) => (
              <Card
                key={character.id}
                className="flex flex-col overflow-hidden group transition-all duration-300 
            hover:-translate-y-2 hover:shadow-lg border-border/20 hover:border-primary/30"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={character.node.image.large || ""}
                    alt={character.node.name.full}
                    fill
                    className="object-cover transition-transform duration-300 
                group-hover:scale-110 brightness-[0.9] group-hover:brightness-100"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority
                  />
                </div>
                <CardContent className="p-3 flex flex-col items-center justify-between flex-grow">
                  <h3 className="font-bold text-sm text-center mb-2 line-clamp-2 text-foreground/90">
                    {character.node.name.full}
                  </h3>
                  {character.voiceActors &&
                    character.voiceActors.length > 0 && (
                      <div className="flex flex-warp gap-2.5 items-center justify-center w-full">
                        <div className="relative w-12 h-12 mb-1 mt-3.5 rounded-full overflow-hidden">
                          <Image
                            src={character.voiceActors[0].image.large || ""}
                            alt={character.voiceActors[0].name.full}
                            fill
                            className="object-cover rounded-full border-2 border-primary/20 
                      transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority
                          />
                        </div>
                        <span className="text-xs text-muted-foreground text-center line-clamp-1">
                          {character.voiceActors[0].name.full}
                        </span>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p
              className="col-span-full text-center text-muted-foreground py-8 
        bg-muted/50 rounded-lg border border-border/50"
            >
              No character information available
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="relations">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {anime.relations &&
          anime.relations.edges &&
          anime.relations.edges.length > 0 ? (
            anime.relations.edges.map((relation: RelationEdge) => (
              <Link key={relation.node.id} href={`/anime/${relation.node.id}`}>
                <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={relation.node.coverImage.large || ""}
                      alt={
                        relation.node.title.english ||
                        relation.node.title.romaji
                      }
                      fill
                      className="object-cover brightness-85"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="line-clamp-1 font-semibold text-sm">
                      {relation.node.title.english ||
                        relation.node.title.romaji}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {relation.relationType.replace(/_/g, " ")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-8 bg-muted/50 rounded-lg border border-border/50">
              No related anime available
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="recommendations">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {anime.recommendations &&
          anime.recommendations.nodes &&
          anime.recommendations.nodes.length > 0 ? (
            anime.recommendations.nodes.map((rec: Recommendation) => (
              <Link
                key={rec.mediaRecommendation.id}
                href={`/anime/${rec.mediaRecommendation.id}`}
              >
                <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={rec.mediaRecommendation.coverImage.large || ""}
                      alt={
                        rec.mediaRecommendation.title.english ||
                        rec.mediaRecommendation.title.romaji
                      }
                      fill
                      className="object-cover brightness-85"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="line-clamp-2 font-semibold text-sm">
                      {rec.mediaRecommendation.title.english ||
                        rec.mediaRecommendation.title.romaji}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-8 bg-muted/50 rounded-lg border border-border/50">
              No recommendations available
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
