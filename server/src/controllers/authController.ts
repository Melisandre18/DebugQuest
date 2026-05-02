import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import prisma from "../models/prisma.js";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function validateUsername(username: unknown): string | null {
  if (!username || typeof username !== "string") return "Username is required";
  if (username.length < 3)          return "Username must be at least 3 characters";
  if (username.length > 20)         return "Username must be at most 20 characters";
  if (!USERNAME_RE.test(username))  return "Only letters, numbers, and underscores allowed";
  return null;
}

export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body as { username: unknown; password: unknown };

    const usernameError = validateUsername(username);
    if (usernameError) return res.status(400).json({ error: usernameError });

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { username: username as string } });
    if (existing) return res.status(409).json({ error: "Username already taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username: username as string, passwordHash },
    });

    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    console.error("[authController] register:", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid username or password" });

    res.json({ id: user.id, username: user.username });
  } catch (err) {
    console.error("[authController] login:", err);
    res.status(500).json({ error: "Login failed" });
  }
}
