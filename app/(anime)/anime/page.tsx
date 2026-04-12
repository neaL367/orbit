import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { DiscoveryRouteClient } from "./_components/discovery-route-client"
import { DiscoveryPageSkeleton } from "./discovery-page-skeleton"
import { withDefaultDiscoverySort } from "@/lib/anime/discovery-search-params"

export const metadata: Metadata = {
  title: "Discovery Registry — Database Exploration",
  description:
    "Filter and explore the global anime archive. Search through thousands of entries by genre, season, year, and format.",
  alternates: {
    canonical: "/anime",
  },
}

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const sort = typeof raw.sort === "string" ? raw.sort : undefined
  if (!sort) {
    redirect(withDefaultDiscoverySort(raw))
  }

  return (
    <Suspense fallback={<DiscoveryPageSkeleton />}>
      <DiscoveryRouteClient />
    </Suspense>
  )
}
