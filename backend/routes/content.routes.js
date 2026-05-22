import { Router } from "express";
import { getTrending, search, getContentDetails, addToHistroy, addtoWishlist, removeFromWishlist } from "../controllers/content.controller.js";

const router = Router();


//routes of content 
router.get("/search", search);
router.get("/trending", getTrending);
router.get("/:id", getContentDetails);
router.post("/history", addToHistroy);
router.post("/wishlist", addtoWishlist);
router.post("/wishlist/remove", removeFromWishlist);

export default router;