import { cache } from 'react'
import type { MediaSeason } from '@/graphql/graphql'

export const getCurrentSeason = cache((): MediaSeason => {
  const month = new Date().getMonth() + 1
  if (month >= 1 && month <= 3) return 'WINTER' as MediaSeason
  if (month >= 4 && month <= 6) return 'SPRING' as MediaSeason
  if (month >= 7 && month <= 9) return 'SUMMER' as MediaSeason
  return 'FALL' as MediaSeason
})

export const getCurrentYear = cache((): number => {
  return new Date().getFullYear()
})

export const getNextSeason = cache((): MediaSeason => {
  const month = new Date().getMonth() + 1
  if (month >= 1 && month <= 3) return 'SPRING' as MediaSeason
  if (month >= 4 && month <= 6) return 'SUMMER' as MediaSeason
  if (month >= 7 && month <= 9) return 'FALL' as MediaSeason
  return 'WINTER' as MediaSeason
})

export const getNextSeasonYear = cache((): number => {
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  if (month >= 10) return year + 1
  return year
})

