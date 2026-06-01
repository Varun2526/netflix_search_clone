import { Router } from "express";
import { getUserProfile, updateFavoriteGenres } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// route to get user profile details
router.get("/profile/:id", verifyToken, getUserProfile);

// route to update user favorite genres
router.put("/favorite-genres", verifyToken, updateFavoriteGenres);

export default router;
