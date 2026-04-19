import { Program, Stmt, Expr } from "@/lib/puzzle-engine";
import { cn } from "@/lib/utils";

interface Props {
  program: Program;
  activeStmtId?: string;
  bugStmtId?: string;
  showBug?: boolean;
}

function exprText(e: Expr): string {
  switch (e.kind) {
    case "num": return String(e.value);
    case "str": return `"${e.value}"`;
    case "var": return e.name;
    case "bin": return `${exprText(e.left)} ${e.op} ${exprText(e.right)}`;
  }
}

function Block({
  color, label, body, stmt, activeStmtId, bugStmtId, showBug, children,
}: {
  color: string;
  label: React.ReactNode;
  body?: Stmt[];
  stmt: Stmt;
  activeStmtId?: string;
  bugStmtId?: string;
  showBug?: boolean;
  children?: React.ReactNode;
}) {
  const isActive = activeStmtId === stmt.id;
  const isBug = showBug && bugStmtId === stmt.id;
  return (
    <div
      className={cn(
        "rounded-lg border-2 transition-all",
        color,
        isActive && "ring-2 ring-primary shadow-glow-primary scale-[1.01]",
        isBug && !isActive && "ring-2 ring-destructive/70 animate-glow-pulse"
      )}
    >
      <div className="px-3 py-2 font-mono text-xs flex items-center gap-2 flex-wrap">
        {label}
      </div>
      {body && (
        <div className="ml-4 pl-3 pr-2 pb-2 border-l-2 border-current/30 space-y-1.5">
          {children}
        </div>
      )}
    </div>
  );
}

function renderStmts(stmts: Stmt[], activeStmtId?: string, bugStmtId?: string, showBug?: boolean): React.ReactNode {
  return stmts.map((s) => {
    if (s.kind === "assign") {
      return (
        <Block key={s.id} stmt={s} activeStmtId={activeStmtId} bugStmtId={bugStmtId} showBug={showBug}
               color="bg-primary/10 border-primary/40 text-primary-glow"
               label={<><span className="opacity-70">set</span> <b>{s.name}</b> <span className="opacity-70">=</span> <span>{exprText(s.value)}</span></>} />
      );
    }
    if (s.kind === "print") {
      return (
        <Block key={s.id} stmt={s} activeStmtId={activeStmtId} bugStmtId={bugStmtId} showBug={showBug}
               color="bg-accent/10 border-accent/40 text-accent-glow"
               label={<><span className="opacity-70">print</span> <span>{exprText(s.value)}</span></>} />
      );
    }
    if (s.kind === "return") {
      return (
        <Block key={s.id} stmt={s} activeStmtId={activeStmtId} bugStmtId={bugStmtId} showBug={showBug}
               color="bg-success/10 border-success/40 text-success"
               label={<><span className="opacity-70">return</span> <span>{exprText(s.value)}</span></>} />
      );
    }
    if (s.kind === "if") {
      return (
        <Block key={s.id} stmt={s} activeStmtId={activeStmtId} bugStmtId={bugStmtId} showBug={showBug} body={s.then}
               color="bg-purple-500/10 border-purple-500/40 text-purple-300"
               label={<><span className="opacity-70">if</span> <span>{exprText(s.cond)}</span> <span className="opacity-70">then</span></>}>
          {renderStmts(s.then, activeStmtId, bugStmtId, showBug)}
          {s.else && (
            <>
              <div className="text-xs font-mono opacity-70 pt-1">else</div>
              {renderStmts(s.else, activeStmtId, bugStmtId, showBug)}
            </>
          )}
        </Block>
      );
    }
    if (s.kind === "while") {
      return (
        <Block key={s.id} stmt={s} activeStmtId={activeStmtId} bugStmtId={bugStmtId} showBug={showBug} body={s.body}
               color="bg-orange-500/10 border-orange-500/40 text-orange-300"
               label={<><span className="opacity-70">while</span> <span>{exprText(s.cond)}</span> <span className="opacity-70">repeat</span></>}>
          {renderStmts(s.body, activeStmtId, bugStmtId, showBug)}
        </Block>
      );
    }
    if (s.kind === "for") {
      return (
        <Block key={s.id} stmt={s} activeStmtId={activeStmtId} bugStmtId={bugStmtId} showBug={showBug} body={s.body}
               color="bg-orange-500/10 border-orange-500/40 text-orange-300"
               label={<><span className="opacity-70">for</span> <b>{s.var}</b> <span className="opacity-70">from</span> {exprText(s.from)} <span className="opacity-70">to</span> {exprText(s.to)}{s.inclusive && <span className="opacity-70"> (inclusive)</span>}</>}>
          {renderStmts(s.body, activeStmtId, bugStmtId, showBug)}
        </Block>
      );
    }
    return null;
  });
}

export default function BlockView({ program, activeStmtId, bugStmtId, showBug }: Props) {
  return (
    <div className="card-surface rounded-lg p-4 overflow-auto max-h-[420px]">
      <div className="space-y-1.5">
        {renderStmts(program, activeStmtId, bugStmtId, showBug)}
      </div>
    </div>
  );
}
