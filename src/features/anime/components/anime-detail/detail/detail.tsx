"use client";

import { notFound, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CACHE_TIMES } from "@/lib/constants";
import { DetailView } from "./view";
import { Age } from "../anime-detail-view/age/age";
import { Loading } from "./loading";
import { Error } from "./error";
import { useGraphQL } from "@/lib/graphql/hooks";
import { AnimeByIdQuery } from "@/lib/graphql/queries/anime-by-id";
import type { Media } from "@/lib/graphql/types/graphql";

function AnimeDetailContent({
  animeId,
  initialData,
}: {
  animeId: string;
  initialData?: unknown;
}) {
  const router = useRouter();
  const id = parseInt(animeId, 10);

  const [isAgeVerified, setIsAgeVerified] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("age_verified") === "true";
    }
    return false;
  });

  useEffect(() => {
    const sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
      sessionStorage.setItem("session_id", crypto.randomUUID());
      sessionStorage.removeItem("age_verified");
    }
  }, []);

  if (isNaN(id)) {
    notFound();
  }

  const { data, isLoading, error, refetch } = useGraphQL(
    AnimeByIdQuery,
    { id: id },
    {
      staleTime: CACHE_TIMES.LONG,
      retry: 2,
      initialData,
    },
  );

  if (isLoading) {
    return <Loading />;
  }

  const mediaData = data as { Media?: Media } | undefined;
  const anime = mediaData?.Media;

  if (error || !anime) {
    return <Error onRetry={() => refetch()} />;
  }

  const handleAgeVerified = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("age_verified", "true");
      setIsAgeVerified(true);
    }
  };

  const handleAgeDeclined = () => {
    router.back();
  };

  if (anime.isAdult && !isAgeVerified) {
    return (
      <Age onVerified={handleAgeVerified} onDeclined={handleAgeDeclined} />
    );
  }

  return <DetailView data={anime} />;
}

export function AnimeDetail({
  animeId,
  initialData,
}: {
  animeId: string;
  initialData?: unknown;
}) {
  return (
    <Suspense>
      <AnimeDetailContent animeId={animeId} initialData={initialData} />
    </Suspense>
  );
}
