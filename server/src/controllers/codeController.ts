import { Request, Response } from "express";
import vm from "node:vm";
import { spawn } from "node:child_process";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, unlink, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

const execAsync = promisify(exec);

// python3 on Linux/Mac, python on Windows
const PYTHON_CMD = process.platform === "win32" ? "python" : "python3";

interface RunResult {
  output: string;
  error: string | null;
  executionTimeMs: number;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v) ?? String(v); } catch { return String(v); }
}

// Spawn a process, pipe stdin, collect stdout/stderr, enforce timeout.
function spawnRun(
  cmd: string,
  args: string[],
  stdin: string,
  start: number,
  cwd?: string,
): Promise<RunResult> {
  return new Promise(resolve => {
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(cmd, args, { stdio: "pipe", cwd });
    } catch (err) {
      return resolve({ output: "", error: String(err), executionTimeMs: Date.now() - start });
    }

    const out: Buffer[] = [];
    const err: Buffer[] = [];

    child.stdout?.on("data", (d: Buffer) => out.push(d));
    child.stderr?.on("data", (d: Buffer) => err.push(d));

    child.stdin?.write(stdin);
    child.stdin?.end();

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({
        output: Buffer.concat(out).toString().trimEnd(),
        error: "Timed out after 5 s",
        executionTimeMs: Date.now() - start,
      });
    }, 5000);

    child.on("close", code => {
      clearTimeout(timer);
      const outStr = Buffer.concat(out).toString().trimEnd();
      const errStr = Buffer.concat(err).toString().trimEnd();
      resolve({
        output: outStr,
        error: errStr || (code !== 0 ? `Exited with code ${code}` : null),
        executionTimeMs: Date.now() - start,
      });
    });

    child.on("error", e => {
      clearTimeout(timer);
      resolve({
        output: "",
        error: e.message.includes("ENOENT")
          ? `"${cmd}" not found — is it installed and on PATH?`
          : e.message,
        executionTimeMs: Date.now() - start,
      });
    });
  });
}

// ─── JavaScript (vm) ─────────────────────────────────────────────────────────
// prompt() reads from the stdin lines provided by the user in the input panel.

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
    // prompt() reads the next stdin line (mirrors browser behaviour)
    prompt: (_msg?: string) => inputLines[inputIdx++] ?? null,
    alert:  (msg?: unknown) => logs.push(String(msg ?? "")),
    Math, JSON, Array, Object, String, Number, Boolean, Date, RegExp, Error,
    parseInt, parseFloat, isNaN, isFinite,
    // block dangerous globals
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

// ─── Python ───────────────────────────────────────────────────────────────────

function runPython(code: string, stdin: string): Promise<RunResult> {
  return spawnRun(PYTHON_CMD, ["-c", code], stdin, Date.now());
}

// ─── C++ ─────────────────────────────────────────────────────────────────────

async function runCpp(code: string, stdin: string): Promise<RunResult> {
  const id   = randomUUID();
  const dir  = join(tmpdir(), `dq_${id}`);
  const src  = join(dir, "main.cpp");
  const bin  = join(dir, process.platform === "win32" ? "main.exe" : "main");
  const start = Date.now();

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(src, code);

    // Compile
    try {
      await execAsync(`g++ -o "${bin}" "${src}" -std=c++17`, { timeout: 15000 });
    } catch (e: any) {
      return {
        output: "",
        error: (e.stderr ?? e.message).trimEnd(),
        executionTimeMs: Date.now() - start,
      };
    }

    // Run
    return await spawnRun(bin, [], stdin, start, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// ─── Java ─────────────────────────────────────────────────────────────────────

function extractClassName(code: string): string {
  return code.match(/public\s+class\s+(\w+)/)?.[1] ?? "Main";
}

async function runJava(code: string, stdin: string): Promise<RunResult> {
  const id        = randomUUID();
  const dir       = join(tmpdir(), `dq_${id}`);
  const className = extractClassName(code);
  const src       = join(dir, `${className}.java`);
  const start     = Date.now();

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(src, code);

    // Compile
    try {
      await execAsync(`javac "${src}"`, { timeout: 15000 });
    } catch (e: any) {
      return {
        output: "",
        error: (e.stderr ?? e.message).trimEnd(),
        executionTimeMs: Date.now() - start,
      };
    }

    // Run
    return await spawnRun("java", ["-cp", dir, className], stdin, start, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function runCode(req: Request, res: Response) {
  const { language, code, stdin = "" } = req.body as {
    language?: string;
    code?: string;
    stdin?: string;
  };

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "code is required" });
  }
  if (!language) {
    return res.status(400).json({ error: "language is required" });
  }

  switch (language) {
    case "javascript": return res.json(runJavaScript(code, stdin));
    case "python":     return res.json(await runPython(code, stdin));
    case "cpp":        return res.json(await runCpp(code, stdin));
    case "java":       return res.json(await runJava(code, stdin));
    default:           return res.status(400).json({ error: `Unknown language: ${language}` });
  }
}
