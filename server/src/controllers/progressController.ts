import { Request, Response } from "express";
import prisma from "../models/prisma.js";

export async function getProgress(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId required" });
    }

    const attempts = await prisma.attempt.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    res.json(attempts);
  } catch (err) {
    console.error("[progressController] getProgress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
}

export async function deleteProgress(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId required" });
    }

    await prisma.attempt.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (err) {
    console.error("[progressController] deleteProgress:", err);
    res.status(500).json({ error: "Failed to reset progress" });
  }
}
