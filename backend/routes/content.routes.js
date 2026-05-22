import { Router } from "express";
import { getTrending, search, getContentDetails } from "../controllers/content.controller.js";

const router = Router();


//routes of content 
router.get("/search", search);
router.get("/trending", getTrending);
router.get("/:id", getContentDetails);

export default router;