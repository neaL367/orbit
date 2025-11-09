"use client"

import { useState } from "react"
import { Check, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({})
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})

  const handlePopoverOpenChange = (categoryKey: string, isOpen: boolean) => {
    setOpenPopovers((prev) => ({
      ...prev,
      [categoryKey]: isOpen,
    }))
    // Clear search when popover closes
    if (!isOpen) {
      setSearchQueries((prev) => {
        const next = { ...prev }
        delete next[categoryKey]
        return next
      })
    }
  }

  const handleSearchChange = (categoryKey: string, value: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [categoryKey]: value,
    }))
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" w-full md:w-[150px]" align="start">
        {categories.map((category) => {
          const Icon = category.icon
          const isPopoverOpen = openPopovers[category.key] || false
          const searchQuery = searchQueries[category.key] || ""
          
          // Filter options based on search query
          const filteredOptions = (() => {
            if (!searchQuery.trim()) {
              return category.options
            }
            const query = searchQuery.toLowerCase().trim()
            return category.options.filter((option) =>
              option.label.toLowerCase().includes(query)
            )
          })()

          return (
            <Popover
              key={category.key}
              open={isPopoverOpen}
              onOpenChange={(open) => handlePopoverOpenChange(category.key, open)}
              modal={false}
            >
              <PopoverTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    handlePopoverOpenChange(category.key, !isPopoverOpen)
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{category.label}</span>
                </DropdownMenuItem>
              </PopoverTrigger>
              <PopoverContent 
                className="p-0 max-w-[150px] md:max-w-[200px]"
                align="start"
                side="right"
                sideOffset={8}
                onMouseEnter={() => {
                  // Keep popover open when hovering
                  if (!isPopoverOpen) {
                    handlePopoverOpenChange(category.key, true)
                  }
                }}
                onPointerDownOutside={(e) => {
                  // Prevent closing when clicking inside the popover or dropdown menu
                  const target = e.target as HTMLElement
                  const popoverContent = e.currentTarget as HTMLElement
                  const dropdownContent = document.querySelector('[data-slot="dropdown-menu-content"]') as HTMLElement | null
                  
                  if (
                    (popoverContent && popoverContent.contains(target)) ||
                    (dropdownContent && dropdownContent.contains(target))
                  ) {
                    e.preventDefault()
                  }
                }}
                onInteractOutside={(e) => {
                  // Prevent closing when interacting with dropdown menu
                  const target = e.target as HTMLElement
                  const dropdownContent = document.querySelector('[data-slot="dropdown-menu-content"]') as HTMLElement | null
                  
                  if (dropdownContent && dropdownContent.contains(target)) {
                    e.preventDefault()
                  }
                }}
              >
                <div className="p-2 border-b">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(category.key, e.target.value)}
                      className="pl-8 pr-8 h-8 w-full"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearchChange(category.key, "")}
                        className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full max-h-[250px] overflow-y-auto overscroll-contain scroll-smooth custom-scrollbar">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => {
                      const isSelected = category.selectedValues.has(option.value)
                      return (
                        <div
                          key={option.value}
                          onClick={() => {
                            onOptionSelect(category.key, option.value, category.isMultiSelect)
                            if (!category.isMultiSelect) {
                              handlePopoverOpenChange(category.key, false)
                              onOpenChange(false)
                            }
                          }}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-sm cursor-pointer transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            "focus:bg-accent focus:text-accent-foreground outline-none"
                          )}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              onOptionSelect(category.key, option.value, category.isMultiSelect)
                              if (!category.isMultiSelect) {
                                handlePopoverOpenChange(category.key, false)
                                onOpenChange(false)
                              }
                            }
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary shrink-0",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{option.label}</span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                      No results found
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

