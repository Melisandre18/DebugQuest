import { Router } from "express";

const router = Router();

// Health
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Puzzle routes (controllers wired in next steps)
// router.post("/next-puzzle", puzzleController.nextPuzzle);
// router.get("/puzzle",        puzzleController.getById);
// router.get("/puzzle-counts", puzzleController.counts);

// Analytics + adaptive engine (wired in next steps)
// router.post("/attempt", analyticsController.recordAttempt);

export default router;
