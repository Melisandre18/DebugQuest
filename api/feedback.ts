// POST /api/feedback — receives feedback submissions and emails them to the owner.
// Requires GMAIL_USER and GMAIL_PASS (Gmail App Password) environment variables.
import type { IncomingMessage, ServerResponse } from "http";
import nodemailer from "nodemailer";

const RECIPIENT = "gagnidze.tamar24@gtu.ge";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405);
    res.end(JSON.stringify({ error: "method not allowed" }));
    return;
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "invalid JSON" }));
    return;
  }

  const { context, rating, category, message, puzzleId, route } = body;

  if (!message || typeof message !== "string" || message.trim().length < 3) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "message too short" }));
    return;
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    // Not configured — log and return success so the UI doesn't break
    console.warn("GMAIL_USER / GMAIL_PASS not set; feedback not emailed.");
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, emailed: false }));
    return;
  }

  const stars = "⭐".repeat(Math.min(5, Math.max(0, Number(rating) || 0)));
  const puzzleLine = puzzleId ? `<tr><td><b>Puzzle&nbsp;ID:</b></td><td>${puzzleId}</td></tr>` : "";
  const subject = `[DebugQuest] ${category} · ${stars} · ${context === "puzzle" ? `Puzzle ${puzzleId ?? "?"}` : `Page: ${route ?? "/"}`}`;

  const html = `
<h2 style="font-family:sans-serif;color:#6366f1">DebugQuest Feedback</h2>
<table style="font-family:sans-serif;border-collapse:collapse;font-size:14px">
  <tr><td style="padding:4px 12px 4px 0"><b>Context:</b></td><td>${context}</td></tr>
  <tr><td style="padding:4px 12px 4px 0"><b>Rating:</b></td><td>${stars} (${rating}/5)</td></tr>
  <tr><td style="padding:4px 12px 4px 0"><b>Category:</b></td><td>${category}</td></tr>
  <tr><td style="padding:4px 12px 4px 0"><b>Page:</b></td><td>${route ?? "/"}</td></tr>
  ${puzzleLine}
  <tr><td style="padding:4px 12px 4px 0;vertical-align:top"><b>Message:</b></td><td style="white-space:pre-wrap">${message.trim()}</td></tr>
  <tr><td style="padding:4px 12px 4px 0"><b>Time:</b></td><td>${new Date().toISOString()}</td></tr>
</table>
`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });
    await transporter.sendMail({ from: `"DebugQuest" <${gmailUser}>`, to: RECIPIENT, subject, html });
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true, emailed: true }));
  } catch (err) {
    console.error("email send failed:", err);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "send failed" }));
  }
}
