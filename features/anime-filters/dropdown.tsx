"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterCategory = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  options: { label: string; value: string }[]
  selectedValues: Set<string>
  isMultiSelect: boolean
}

type DropdownProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: FilterCategory[]
  onCategorySelect: (categoryKey: string) => void
  onOptionSelect: (categoryKey: string, optionValue: string, isMultiSelect: boolean) => void
}

export function Dropdown({
  open,
  onOpenChange,
  categories,
  onOptionSelect,
}: DropdownProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]" align="start">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <DropdownMenuSub key={category.key}>
              <DropdownMenuSubTrigger>
                <Icon className="mr-2 h-4 w-4" />
                <span>{category.label}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent 
                className="w-[250px] max-h-[300px] overflow-y-auto overscroll-contain scroll-smooth custom-scrollbar"
              >
                {category.options.map((option) => {
                  const isSelected = category.selectedValues.has(option.value)
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={(e) => {
                        e.preventDefault()
                        onOptionSelect(category.key, option.value, category.isMultiSelect)
                        if (!category.isMultiSelect) {
                          onOpenChange(false)
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{option.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

