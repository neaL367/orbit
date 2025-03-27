export function AnimeDescription({ description }: { description: string }) {
    return (
      <p className="mb-6 text-sm sm:text-base whitespace-pre-line text-muted-foreground leading-relaxed p-4 bg-muted/50 rounded-lg border border-border/50">
        {description}
      </p>
    )
  }
  
  