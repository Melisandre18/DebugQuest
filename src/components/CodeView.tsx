import { useMemo } from "react";
import { Program, Language, programToSource } from "@/lib/puzzle-engine";
import { cn } from "@/lib/utils";

interface Props {
  program: Program;
  language: Language;
  activeStmtId?: string;
  bugStmtId?: string;
  showBug?: boolean;
}

const KEYWORDS_PY   = ["if","else","elif","while","for","in","range","def","return","print","True","False","and","or","not","None"];
const KEYWORDS_JS   = ["if","else","while","for","let","const","var","return","function","true","false","console","null","undefined"];
const KEYWORDS_CPP  = ["if","else","while","for","int","return","include","using","namespace","std","cout","endl","string","void","main","true","false","public","static"];
const KEYWORDS_JAVA = ["if","else","while","for","int","return","public","class","static","void","String","System","out","println","true","false","null","new","Main"];

const EXT: Record<Language, string> = {
  python: "py", javascript: "js", cpp: "cpp", java: "java",
};
const FILENAMES: Record<Language, string> = {
  python: "main.py", javascript: "main.js", cpp: "main.cpp", java: "Main.java",
};

function tokenize(line: string, lang: Language) {
  const kws =
    lang === "python" ? KEYWORDS_PY :
    lang === "javascript" ? KEYWORDS_JS :
    lang === "cpp" ? KEYWORDS_CPP :
    KEYWORDS_JAVA;
  // very small tokenizer: comments, strings, numbers, idents, ops/whitespace
  const re = /("[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|(\s+)|([^\sA-Za-z0-9_"']+)/g;
  const out: { t: string; k: "str"|"num"|"kw"|"id"|"ws"|"op"|"call" }[] = [];
  let m: RegExpExecArray | null;
  let lastIdent = "";
  while ((m = re.exec(line)) !== null) {
    if (m[1]) out.push({ t: m[1], k: "str" });
    else if (m[2]) out.push({ t: m[2], k: "num" });
    else if (m[3]) {
      const isKw = kws.includes(m[3]);
      out.push({ t: m[3], k: isKw ? "kw" : "id" });
      lastIdent = m[3];
    }
    else if (m[4]) out.push({ t: m[4], k: "ws" });
    else if (m[5]) out.push({ t: m[5], k: "op" });
  }
  void lastIdent;
  return out;
}

export default function CodeView({ program, language, activeStmtId, bugStmtId, showBug }: Props) {
  const lines = useMemo(() => programToSource(program, language), [program, language]);

  return (
    <div className="code-surface rounded-lg overflow-hidden text-sm relative">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-code-line/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          {FILENAMES[language]}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 ml-auto">
          .{EXT[language]} · view-only
        </span>
      </div>
      <div className="p-3 overflow-auto max-h-[420px]">
        {lines.map(({ line, text, stmtId }) => {
          const isActive = stmtId && activeStmtId === stmtId;
          const isBug = showBug && stmtId && bugStmtId === stmtId;
          const tokens = tokenize(text, language);
          return (
            <div
              key={line}
              className={cn(
                "flex items-start font-mono leading-6 px-2 -mx-2 rounded transition-colors",
                isActive && "bg-primary/15 ring-1 ring-primary/40",
                isBug && !isActive && "bg-destructive/10 ring-1 ring-destructive/40"
              )}
            >
              <span className="select-none text-code-comment w-8 text-right pr-3 shrink-0">{line}</span>
              <span className="whitespace-pre">
                {tokens.map((tk, i) => (
                  <span
                    key={i}
                    className={cn(
                      tk.k === "kw" && "text-code-keyword",
                      tk.k === "str" && "text-code-string",
                      tk.k === "num" && "text-code-number",
                      tk.k === "op" && "text-foreground/70",
                      tk.k === "id" && "text-foreground",
                      isBug && "text-code-bug"
                    )}
                  >
                    {tk.t}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
