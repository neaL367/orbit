import { Suspense } from 'react'
import type { Metadata } from 'next'
import DiscoveryView from '@/features/anime/components/discovery-view'
import { Container } from '@/components/shared/container'

export const metadata: Metadata = {
    title: 'Discovery Registry — Database Exploration',
    description: 'Filter and explore the global anime archive. search through thousands of entries by genre, season, year, and format.',
    alternates: {
        canonical: '/anime',
    },
}

export default function DiscoveryPage() {
    return (
        <Container className="py-20 lg:py-32">
            <Suspense fallback={<div className="h-96 w-full shimmer" />}>
                <DiscoveryView />
            </Suspense>
        </Container>
    )
}
