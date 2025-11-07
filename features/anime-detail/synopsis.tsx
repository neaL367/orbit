"use client"

type SynopsisProps = {
  description?: string | null
}

export function Synopsis({ description }: SynopsisProps) {
  if (!description) return null

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Synopsis</h2>
      <div className="p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl bg-zinc-900/50 border border-zinc-800">
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed break-words">
          {description.replace(/<[^>]*>/g, "")}
        </p>
      </div>
    </div>
  )
}

