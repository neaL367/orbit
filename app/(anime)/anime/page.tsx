import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { DiscoveryRouteClient } from "./_components/discovery-route-client"
import { DiscoveryPageSkeleton } from "./discovery-page-skeleton"
import { withDefaultDiscoverySort } from "@/lib/anime/discovery-search-params"
import { parseDiscoveryFilters, getDiscoveryVariables, getQueryConfig } from '@/features/anime/utils/discovery'
import { getCurrentSeason, getCurrentYear } from '@/lib/utils'

export const metadata: Metadata = {
  title: "Discovery Registry — Database Exploration",
  description:
    "Filter and explore the global anime archive. Search through thousands of entries by genre, season, year, and format.",
  alternates: {
    canonical: "/anime",
  },
}

async function DiscoveryRouteServer({ rawParams }: { rawParams: Record<string, string | string[] | undefined> }) {
  const filters = parseDiscoveryFilters(rawParams)
  const dateValues = { currentSeason: getCurrentSeason(), currentYear: getCurrentYear() }
  const variables = getDiscoveryVariables(filters, dateValues as any)
  const { queryKey, fetcher } = getQueryConfig(filters.sort, variables)

  const queryClient = new QueryClient()
  await queryClient.prefetchInfiniteQuery({
    queryKey,
    initialPageParam: { page: 1 },
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as any).page
      const withPage = { ...variables, page }
      return fetcher(withPage as any)()
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DiscoveryRouteClient />
    </HydrationBoundary>
  )
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
      <DiscoveryRouteServer rawParams={raw} />
    </Suspense>
  )
}
