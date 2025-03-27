"use client"

import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SeasonalFiltersProps {
  currentSeason: string
  currentYear: number
  years: number[]
}

export default function SeasonalFilters({ currentSeason, currentYear, years }: SeasonalFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSeasonChange = (value: string) => {
    const params = new URLSearchParams()
    params.set("season", value)
    params.set("year", currentYear.toString())
    params.set("page", "1") // Reset to page 1 when filters change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleYearChange = (value: string) => {
    const params = new URLSearchParams()
    params.set("season", currentSeason.toLowerCase())
    params.set("year", value)
    params.set("page", "1") // Reset to page 1 when filters change
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-8 flex flex-wrap gap-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Season</h3>
        <Select defaultValue={currentSeason.toLowerCase()} onValueChange={handleSeasonChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="winter">Winter</SelectItem>
            <SelectItem value="spring">Spring</SelectItem>
            <SelectItem value="summer">Summer</SelectItem>
            <SelectItem value="fall">Fall</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Year</h3>
        <Select defaultValue={currentYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

