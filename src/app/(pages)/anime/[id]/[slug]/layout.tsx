import type React from "react";
import { ANIME_DETAILS_QUERY } from "@/app/graphql/queries/detail";
import { Client } from "@/lib/apollo-client";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id, slug } = await params;

  const client = Client;
  const { data } = await client.query({
    query: ANIME_DETAILS_QUERY,
    variables: { id: id },
  });

  const anime = data?.Media;

  if (!anime) {
    return {
      title: `${slug} | Orbit`,
      description: `Discover details about ${slug} on Orbit.`,
    };
  }

  // Get the best available title
  const title =
    anime.title.userPreferred ||
    anime.title.english ||
    anime.title.romaji ||
    slug;

  // Create a clean description from anime description or fallback
  const description = anime.description
    ? anime.description.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
    : `Discover details about ${title} on Orbit.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "website",
      images:
        anime.bannerImage || anime.coverImage?.large
          ? [{ url: anime.bannerImage || anime.coverImage.large }]
          : [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images:
        anime.bannerImage || anime.coverImage?.large
          ? [anime.bannerImage || anime.coverImage.large]
          : [],
    },
  };
}

export default function AnimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
