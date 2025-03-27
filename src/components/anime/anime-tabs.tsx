import Image from "next/image"
import { Link } from "next-view-transitions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AnimeMedia, Character, Recommendation, Relation } from "@/anilist/utils/types"

export function AnimeTabs({ anime }: { anime: AnimeMedia }) {
  return (
    <Tabs defaultValue="characters" className="mt-8">
      <TabsList className="w-full mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 h-auto">
        <TabsTrigger value="characters" className="w-full text-xs sm:text-sm px-2 py-2 hover:cursor-pointer">
          Characters
        </TabsTrigger>
        <TabsTrigger value="relations" className="w-full text-xs sm:text-sm px-2 py-2 hover:cursor-pointer">
          Relations
        </TabsTrigger>
        <TabsTrigger value="recommendations" className="w-full text-xs sm:text-sm px-2 py-2 hover:cursor-pointer">
          Recommendations
        </TabsTrigger>
      </TabsList>

      <TabsContent value="characters">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {anime.characters && anime.characters.nodes && anime.characters.nodes.length > 0 ? (
            anime.characters.nodes.map((character: Character) => (
              <Card
                key={character.id}
                className="w-full overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={character.image.medium || ""}
                    alt={character.name.full}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="line-clamp-1 font-semibold text-sm">{character.name.full}</h3>
                  <p className="text-xs text-muted-foreground">{character.gender || "Character"}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-8 bg-muted/50 rounded-lg border border-border/50">
              No character information available
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="relations">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {anime.relations && anime.relations.edges && anime.relations.edges.length > 0 ? (
            anime.relations.edges.map((relation: Relation) => (
              <Link key={relation.node.id} href={`/anime/${relation.node.id}`}>
                <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={relation.node.coverImage.medium || ""}
                      alt={relation.node.title.english || relation.node.title.romaji}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="line-clamp-1 font-semibold text-sm">
                      {relation.node.title.english || relation.node.title.romaji}
                    </h3>
                    <p className="text-xs text-muted-foreground">{relation.relationType.replace(/_/g, " ")}</p>
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
          {anime.recommendations && anime.recommendations.nodes && anime.recommendations.nodes.length > 0 ? (
            anime.recommendations.nodes.map((rec: Recommendation) => (
              <Link key={rec.mediaRecommendation.id} href={`/anime/${rec.mediaRecommendation.id}`}>
                <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={rec.mediaRecommendation.coverImage.medium || ""}
                      alt={rec.mediaRecommendation.title.english || rec.mediaRecommendation.title.romaji}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="line-clamp-2 font-semibold text-sm">
                      {rec.mediaRecommendation.title.english || rec.mediaRecommendation.title.romaji}
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
  )
}

