import { Router } from "express";
import {register,login,logout,googleAuth,githubAuth,} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleAuth);
router.post("/github", githubAuth);

export default router;
