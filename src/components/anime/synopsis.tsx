interface SynopsisProps {
  description: string;
}

export function Synopsis({ description }: SynopsisProps) {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border shadow-sm">
      <h3 className="font-semibold mb-4">Synopsis</h3>
      <div
        className="text-muted-foreground prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-foreground prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}