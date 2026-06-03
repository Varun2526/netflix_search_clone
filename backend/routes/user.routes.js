import { Router } from "express";
import { getUserProfile, updateFavoriteGenres, getWishlist, getHistory } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// route to get user profile details
router.get("/profile/:id", verifyToken, getUserProfile);

// route to update user favorite genres
router.put("/favorite-genres", verifyToken, updateFavoriteGenres);

// protected wishlist and history routes
router.get("/wishlist", verifyToken, getWishlist);
router.get("/history", verifyToken, getHistory);

export default router;
