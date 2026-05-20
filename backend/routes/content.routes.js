import { Router } from "express";
import { getTrending, search } from "../controllers/content.controller.js";

const router = Router();


//routes of content 
router.get("/search", search);
router.get("/trending", getTrending);

export default router;