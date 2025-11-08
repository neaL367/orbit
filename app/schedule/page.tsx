import { Schedule } from '@/features/schedule'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anime Schedule',
  description: 'View the weekly anime schedule. See when your favorite anime episodes air this week. Browse upcoming episodes by day and never miss a release.',
  keywords: ['anime schedule', 'anime episodes', 'airing schedule', 'weekly anime', 'upcoming episodes', 'anime release dates'],
  openGraph: {
    title: 'Anime Schedule | AnimeX',
    description: 'View the weekly anime schedule. See when your favorite anime episodes air this week.',
    type: 'website',
    url: '/schedule',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anime Schedule | AnimeX',
    description: 'View the weekly anime schedule. See when your favorite anime episodes air this week.',
  },
}



export default function SchedulePage() {
  return <Schedule />
}

