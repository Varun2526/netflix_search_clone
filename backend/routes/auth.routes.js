import { Router } from "express";
import { register, login, logout, googleAuth, githubAuth, getCurrentUser } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.post("/github", githubAuth);
// Protected route to get current logged‑in user
router.get("/me", verifyToken, getCurrentUser);

export default router;
