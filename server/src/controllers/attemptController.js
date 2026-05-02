import prisma from "../models/prisma.js";

export async function logAttempt(req, res) {
  try {
    const {
      userId,
      challengeId,
      score,
      time,
      hintsUsed,
      bugType,
      correct,
      difficulty,
      language,
      performance,
      retriesCount,
    } = req.body;

    if (!userId || !challengeId || score == null || time == null) {
      return res.status(400).json({
        error: "Missing required fields: userId, challengeId, score, time",
      });
    }

    const attempt = await prisma.attempt.create({
      data: {
        // Auto-create the user row on first attempt (no auth yet — userId is a localStorage UUID)
        user: {
          connectOrCreate: {
            where:  { id: userId },
            create: { id: userId, email: `${userId}@local` },
          },
        },
        challengeId,
        score,
        time,
        hintsUsed:    hintsUsed    ?? 0,
        bugType:      bugType      ?? "unknown",
        correct:      correct      ?? true,
        difficulty:   difficulty   ?? "easy",
        language:     language     ?? null,
        performance:  performance  ?? null,
        retriesCount: retriesCount ?? 0,
      },
    });

    res.status(201).json(attempt);
  } catch (err) {
    console.error("[attemptController] logAttempt:", err);
    res.status(500).json({ error: "Failed to log attempt" });
  }
}
