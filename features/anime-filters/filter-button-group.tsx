"use client"

import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type FilterCategory = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  options: { label: string; value: string }[]
  selectedValues: Set<string>
  isMultiSelect: boolean
  value: string
  displayValue: string
}

type FilterButtonGroupProps = {
  category: FilterCategory
  hasValue: boolean
  isOpen: boolean
  onSelect: (categoryKey: string, optionValue: string) => void
  onClear: (categoryKey: string) => void
  onOpenChange: (isOpen: boolean) => void
}

export function FilterButtonGroup({
  category,
  hasValue,
  isOpen,
  onSelect,
  onClear,
  onOpenChange,
}: FilterButtonGroupProps) {
  const Icon = category.icon

  // Only show button group if there's a value or the popover is open
  if (!hasValue && !isOpen) {
    return null
  }

  return (
    <ButtonGroup key={category.key}>
      <Button
        variant="outline"
        size="sm"
        className="h-8 pointer-events-none"
      >
        <Icon className="mr-2 h-4 w-4" />
        {category.label}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-muted-foreground pointer-events-none"
      >
        is
      </Button>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
          >
            {category.displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0 max-h-[300px]" align="start" side="right">
          <Command>
            <CommandInput placeholder={`Search ${category.label.toLowerCase()}...`} />
            <CommandList className="max-h-[280px] custom-scrollbar">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {category.options.map((option) => {
                  const isSelected = category.selectedValues.has(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => onSelect(category.key, option.value)}
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
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClear(category.key)}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </ButtonGroup>
  )
}

