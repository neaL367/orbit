"use client"

type SynopsisProps = {
  description?: string | null
}

export function Synopsis({ description }: SynopsisProps) {
  if (!description) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Synopsis</h2>
        <p className="text-sm text-zinc-400">Story overview and plot details</p>
      </div>
      <div className="p-5 sm:p-6 md:p-8 rounded-xl bg-zinc-900/60 border border-zinc-800/50 shadow-lg">
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed break-words whitespace-pre-line">
          {description.replace(/<[^>]*>/g, "")}
        </p>
      </div>
    </div>
  )
}

