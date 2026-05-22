import { Router } from "express";
import { getTrending, search, getContentDetails, addToHistory, addToWishlist, removeFromWishlist } from "../controllers/content.controller.js";

const router = Router();


//routes of content 
router.get("/search", search);
router.get("/trending", getTrending);
router.get("/:id", getContentDetails);
router.post("/history", addToHistory);
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/remove", removeFromWishlist);

export default router;