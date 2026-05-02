import { Router } from "express";
import { logAttempt } from "../controllers/attemptController.js";

const router = Router();

// Health
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Core analytics endpoint — logs every solved attempt to Postgres
router.post("/attempt", logAttempt);

// Puzzle routes (wired in next step)
// router.post("/next-puzzle", puzzleController.nextPuzzle);
// router.get("/puzzle",        puzzleController.getById);
// router.get("/puzzle-counts", puzzleController.counts);

export default router;
