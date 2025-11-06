import { ImageResponse } from "next/og";
import { Client } from "@/lib/apollo-client";
import { ANIME_DETAILS_QUERY } from "@/app/graphql/queries/detail";

export const alt = "Anime Details";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const client = Client;
  const { data } = await client.query({
    query: ANIME_DETAILS_QUERY,
    variables: { id: id },
  });

  const anime = data?.Media;

  if (!anime) {
    // Fallback image if no anime data
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 60,
            color: "white",
            background: "linear-gradient(to bottom, #111827, #1f2937)",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 50,
          }}
        >
          <div style={{ fontSize: 80, fontWeight: "bold", marginBottom: 20 }}>
            Orbit
          </div>
          <div style={{ fontSize: 40 }}>{slug}</div>
        </div>
      ),
      { ...size }
    );
  }

  // Get the best available title
  const title =
    anime.title.userPreferred ||
    anime.title.english ||
    anime.title.romaji ||
    slug;

  // Create image URL for background
  const imageUrl = anime.bannerImage || anime.coverImage?.large || "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 60,
          color: "white",
          background: "#111827",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "80%",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: "bold",
              lineHeight: 1.2,
              marginBottom: 20,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </div>

          {anime.genres && (
            <div
              style={{
                display: "flex",
                gap: 10,
                fontSize: 24,
                marginBottom: 20,
              }}
            >
              {anime.genres.slice(0, 3).map((genre: string, index: number) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    padding: "6px 12px",
                    borderRadius: 20,
                  }}
                >
                  {genre}
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: 24,
              opacity: 0.9,
              marginTop: 10,
            }}
          >
            Orbit Anime
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
