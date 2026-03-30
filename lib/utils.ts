import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"
import type { MediaSeason } from '@/lib/graphql/types/graphql'

/**
 * Utility function to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get current anime season based on month
 */
export function getCurrentSeason(): MediaSeason {
  const month = new Date().getMonth() + 1
  if (month >= 1 && month <= 3) return 'WINTER' as MediaSeason
  if (month >= 4 && month <= 6) return 'SPRING' as MediaSeason
  if (month >= 7 && month <= 9) return 'SUMMER' as MediaSeason
  return 'FALL' as MediaSeason
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Get next anime season based on current month
 */
export function getNextSeason(): MediaSeason {
  const month = new Date().getMonth() + 1
  if (month >= 1 && month <= 3) return 'SPRING' as MediaSeason
  if (month >= 4 && month <= 6) return 'SUMMER' as MediaSeason
  if (month >= 7 && month <= 9) return 'FALL' as MediaSeason
  return 'WINTER' as MediaSeason
}

/**
 * Get next season's year
 */
export function getNextSeasonYear(): number {
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  if (month >= 10) return year + 1
  return year
}
