import type { IncomingMessage, ServerResponse } from "http";
import vm from "node:vm";
import { spawn } from "node:child_process";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

const execAsync = promisify(exec);
const PYTHON_CMD = "python3";

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
      let error = e.message;
      if (e.message.includes("ENOENT")) {
        if (cmd === "g++")   error = `g++ not available in this environment.`;
        else if (cmd === "javac") error = `javac not available in this environment.`;
        else if (cmd === "python3") error = `Python not available in this environment.`;
        else error = `"${cmd}" not found.`;
      }
      resolve({ output: "", error, executionTimeMs: Date.now() - start });
    });
  });
}

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

function runPython(code: string, stdin: string): Promise<RunResult> {
  return spawnRun(PYTHON_CMD, ["-c", code], stdin, Date.now());
}

async function runCpp(code: string, stdin: string): Promise<RunResult> {
  const id   = randomUUID();
  const dir  = join(tmpdir(), `dq_${id}`);
  const src  = join(dir, "main.cpp");
  const bin  = join(dir, "main");
  const start = Date.now();

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(src, code);
    try {
      await execAsync(`g++ -o "${bin}" "${src}" -std=c++17`, { timeout: 15000 });
    } catch (e: any) {
      return { output: "", error: (e.stderr ?? e.message).trimEnd(), executionTimeMs: Date.now() - start };
    }
    return await spawnRun(bin, [], stdin, start, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

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
    try {
      await execAsync(`javac "${src}"`, { timeout: 15000 });
    } catch (e: any) {
      return { output: "", error: (e.stderr ?? e.message).trimEnd(), executionTimeMs: Date.now() - start };
    }
    return await spawnRun("java", ["-cp", dir, className], stdin, start, dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

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
    case "python":     return json(res, 200, await runPython(code, stdin as string));
    case "cpp":        return json(res, 200, await runCpp(code, stdin as string));
    case "java":       return json(res, 200, await runJava(code, stdin as string));
    default:           return json(res, 400, { error: `Unknown language: ${language}` });
  }
}
