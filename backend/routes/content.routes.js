import { Router } from "express";
import { getTrending, search, getContentDetails, addToHistory, addToWishlist, removeFromWishlist, rateContent, getRecommendations, getContentProviders } from "../controllers/content.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/search", search);
router.get("/trending", getTrending);
router.get("/recommendation", verifyToken, getRecommendations);
router.get("/:id", getContentDetails);
router.get("/:id/providers", getContentProviders);
router.post("/history", verifyToken, addToHistory);
router.post("/wishlist", verifyToken, addToWishlist);
router.delete("/wishlist/remove", verifyToken, removeFromWishlist);
router.post("/rate", verifyToken, rateContent);

export default router;