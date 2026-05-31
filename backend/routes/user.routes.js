import { Router } from "express";
import { getUserProfile, updateFavoriteGenres } from "../controllers/user.controller.js";

const router = Router();

// route to get user profile details
router.get("/profile/:id", getUserProfile);

// route to update user favorite genres
router.put("/favorite-genres", updateFavoriteGenres);

export default router;
