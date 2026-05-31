import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller.js";

const router = Router();

// route to get user profile details
router.get("/profile/:id", getUserProfile);

export default router;
