// Renders a Program (AST) as readable pseudocode.
// Used to populate starterCode on AST-format puzzles.
import type { Expr, Program, Stmt } from "./types.js";

function renderExpr(e: Expr): string {
  switch (e.kind) {
    case "num": return String(e.value);
    case "str": return `"${e.value}"`;
    case "var": return e.name;
    case "bin": {
      const l = e.left.kind  === "bin" ? `(${renderExpr(e.left)})`  : renderExpr(e.left);
      const r = e.right.kind === "bin" ? `(${renderExpr(e.right)})` : renderExpr(e.right);
      return `${l} ${e.op} ${r}`;
    }
  }
}

function renderStmt(s: Stmt, indent: string): string {
  const i2 = indent + "  ";
  switch (s.kind) {
    case "assign": return `${indent}${s.name} = ${renderExpr(s.value)}`;
    case "print":  return `${indent}print(${renderExpr(s.value)})`;
    case "return": return `${indent}return ${renderExpr(s.value)}`;
    case "if": {
      const then = s.then.map(c => renderStmt(c, i2)).join("\n");
      const els  = s.else?.length
        ? `\n${indent}else:\n` + s.else.map(c => renderStmt(c, i2)).join("\n")
        : "";
      return `${indent}if ${renderExpr(s.cond)}:\n${then}${els}`;
    }
    case "while": {
      const body = s.body.map(c => renderStmt(c, i2)).join("\n");
      return `${indent}while ${renderExpr(s.cond)}:\n${body}`;
    }
    case "for": {
      const fromStr = renderExpr(s.from);
      const toStr   = s.inclusive
        ? (s.to.kind === "num" ? String(s.to.value + 1) : `(${renderExpr(s.to)}) + 1`)
        : renderExpr(s.to);
      const body = s.body.map(c => renderStmt(c, i2)).join("\n");
      return `${indent}for ${s.var} in range(${fromStr}, ${toStr}):\n${body}`;
    }
  }
}

export function astToCode(program: Program): string {
  return program.map(s => renderStmt(s, "")).join("\n");
}
