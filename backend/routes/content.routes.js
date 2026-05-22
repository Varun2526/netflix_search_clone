import { Router } from "express";
import { getTrending, search, getContentDetails,addToHistroy } from "../controllers/content.controller.js";

const router = Router();


//routes of content 
router.get("/search", search);
router.get("/trending", getTrending);
router.get("/:id", getContentDetails);
router.post("/history",addToHistroy)
export default router;