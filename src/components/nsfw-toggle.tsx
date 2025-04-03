import { Eye, EyeOff } from "lucide-react";

interface NSFWToggleProps {
  value?: boolean;
  onChange: (value: boolean) => void;
}

export default function NSFWToggle({ value = false, onChange }: NSFWToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer"
    >
      {value ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
      <span>{value ? "Hide NSFW" : "Show NSFW"}</span>
    </button>
  );
}
