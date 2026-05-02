import { Request, Response } from "express";
import prisma from "../models/prisma.js";

export async function logAttempt(req: Request, res: Response) {
  try {
    const {
      userId, challengeId, score, time, hintsUsed,
      bugType, correct, difficulty, language, performance, retriesCount,
    } = req.body as Record<string, unknown>;

    if (!userId || !challengeId || score == null || time == null) {
      return res.status(400).json({
        error: "Missing required fields: userId, challengeId, score, time",
      });
    }

    const attempt = await prisma.attempt.create({
      data: {
        user: {
          connectOrCreate: {
            where:  { id: userId as string },
            create: { id: userId as string, username: userId as string },
          },
        },
        challengeId:  challengeId  as string,
        score:        score        as number,
        time:         time         as number,
        hintsUsed:    (hintsUsed    as number)  ?? 0,
        bugType:      (bugType      as string)  ?? "unknown",
        correct:      (correct      as boolean) ?? true,
        difficulty:   (difficulty   as string)  ?? "easy",
        language:     (language     as string)  ?? null,
        performance:  (performance  as number)  ?? null,
        retriesCount: (retriesCount as number)  ?? 0,
      },
    });

    res.status(201).json(attempt);
  } catch (err) {
    console.error("[attemptController] logAttempt:", err);
    res.status(500).json({ error: "Failed to log attempt" });
  }
}
