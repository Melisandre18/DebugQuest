import type { IncomingMessage, ServerResponse } from "http";
import vm from "node:vm";

interface RunResult {
  output: string;
  error: string | null;
  executionTimeMs: number;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

function str(v: unknown): string {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v) ?? String(v); } catch { return String(v); }
}

// ─── JavaScript: vm sandbox ───────────────────────────────────────────────────
// prompt() reads successive lines from the stdin panel, matching browser behaviour.

function runJavaScript(code: string, stdin: string): RunResult {
  const start = Date.now();
  const logs: string[] = [];
  const inputLines = stdin.split("\n");
  let inputIdx = 0;

  const ctx = vm.createContext({
    console: {
      log:   (...a: unknown[]) => logs.push(a.map(str).join(" ")),
      error: (...a: unknown[]) => logs.push("[error] " + a.map(str).join(" ")),
      warn:  (...a: unknown[]) => logs.push("[warn] "  + a.map(str).join(" ")),
      info:  (...a: unknown[]) => logs.push(a.map(str).join(" ")),
    },
    prompt: (_msg?: string) => inputLines[inputIdx++] ?? null,
    alert:  (msg?: unknown) => logs.push(String(msg ?? "")),
    Math, JSON, Array, Object, String, Number, Boolean, Date, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite,
    process: undefined, require: undefined, globalThis: undefined,
    __dirname: undefined, __filename: undefined,
    setTimeout: undefined, setInterval: undefined, setImmediate: undefined,
    fetch: undefined,
  });

  try {
    const result = new vm.Script(code).runInContext(ctx, { timeout: 5000 });
    if (result !== undefined && result !== null) logs.push(`→ ${str(result)}`);
    return { output: logs.join("\n"), error: null, executionTimeMs: Date.now() - start };
  } catch (err) {
    return {
      output: logs.join("\n"),
      error: err instanceof Error ? err.message : String(err),
      executionTimeMs: Date.now() - start,
    };
  }
}

// ─── Python / C++ / Java: Wandbox (free, no API key) ─────────────────────────

const WANDBOX_URL = "https://wandbox.org/api/compile.json";

interface WandboxCfg {
  compiler: string;
  options?: string;
  prepareCode?: (code: string) => string;
}

const WANDBOX: Record<string, WandboxCfg> = {
  python: { compiler: "cpython-3.10.15" },
  cpp:    { compiler: "gcc-13.2.0", options: "c++17,warning" },
  // Wandbox saves the main file as prog.java; strip `public` from the
  // top-level class so javac doesn't enforce a matching filename.
  java: {
    compiler: "openjdk-jdk-21+35",
    prepareCode: (code) => code.replace(/\bpublic(\s+class\s)/g, "$1"),
  },
};

interface WandboxResponse {
  status: string;
  compiler_error?: string;
  program_output?: string;
  program_error?: string;
}

async function runViaWandbox(lang: string, code: string, stdin: string): Promise<RunResult> {
  const start = Date.now();
  const cfg = WANDBOX[lang];
  const finalCode = cfg.prepareCode ? cfg.prepareCode(code) : code;

  try {
    const res = await fetch(WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compiler: cfg.compiler,
        code: finalCode,
        stdin,
        ...(cfg.options ? { options: cfg.options } : {}),
        save: false,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return { output: "", error: `Execution service error (${res.status})`, executionTimeMs: Date.now() - start };
    }

    const data = await res.json() as WandboxResponse;

    // Compilation error
    if (data.status !== "0" && data.compiler_error) {
      return { output: "", error: data.compiler_error.trim(), executionTimeMs: Date.now() - start };
    }

    const output = (data.program_output ?? "").trimEnd();
    const error  = (data.program_error ?? "").trim() || (data.status !== "0" ? `Exited with code ${data.status}` : null);
    return { output, error, executionTimeMs: Date.now() - start };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = msg.toLowerCase().includes("timeout") || msg.includes("abort");
    return {
      output: "",
      error: isTimeout ? "Timed out waiting for execution service" : `Execution service unreachable: ${msg}`,
      executionTimeMs: Date.now() - start,
    };
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const { language, code, stdin = "" } = body as { language?: string; code?: string; stdin?: string };

  if (!code || typeof code !== "string") return json(res, 400, { error: "code is required" });
  if (!language) return json(res, 400, { error: "language is required" });

  switch (language) {
    case "javascript": return json(res, 200, runJavaScript(code, stdin as string));
    case "python":
    case "cpp":
    case "java":       return json(res, 200, await runViaWandbox(language, code, stdin as string));
    default:           return json(res, 400, { error: `Unknown language: ${language}` });
  }
}
