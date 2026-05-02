import { Router } from "express";
import { logAttempt } from "../controllers/attemptController.js";
import { register, login } from "../controllers/authController.js";
import { getProgress, deleteProgress } from "../controllers/progressController.js";
import { runCode } from "../controllers/codeController.js";

const router = Router();

router.get("/health", (_req, res) => { res.json({ status: "ok" }); });

// Auth
router.post("/auth/register", register);
router.post("/auth/login",    login);

// Progress (scoped to a user)
router.get("/progress",    getProgress);
router.delete("/progress", deleteProgress);

// Code execution sandbox
router.post("/run", runCode);

// Analytics
router.post("/attempt", logAttempt);

export default router;
