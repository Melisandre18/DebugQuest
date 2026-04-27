// Renders a code string with optional line highlighting.
// Used by text-based puzzle types (TextPickFix, TextFillBlank).
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  language?: string;
  bugLine?: number;           // 1-indexed line to highlight in destructive colour
  highlightLine?: number;     // 1-indexed line to highlight in primary colour
  className?: string;
}

export default function CodeDisplay({ code, language, bugLine, highlightLine, className }: Props) {
  const lines = code.split("\n");
  return (
    <div className={cn("code-surface rounded-xl overflow-auto text-sm", className)}>
      {language && (
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono">
            {language}
          </span>
        </div>
      )}
      <pre className="p-4 leading-6 overflow-x-auto">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isBug = lineNum === bugLine;
          const isHighlight = lineNum === highlightLine;
          return (
            <div
              key={i}
              className={cn(
                "flex gap-4 px-1 rounded-sm transition-colors",
                isBug       && "bg-destructive/15 text-destructive border-l-2 border-destructive -ml-px pl-[calc(0.25rem-1px)]",
                isHighlight && "bg-primary/10 text-primary border-l-2 border-primary -ml-px pl-[calc(0.25rem-1px)]",
              )}
            >
              <span className="select-none text-muted-foreground/30 w-5 shrink-0 text-right text-xs leading-6">
                {lineNum}
              </span>
              <code className="flex-1 whitespace-pre">{line || " "}</code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
