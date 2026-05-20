import express from "express";
import { searchContent } from "../controllers/content.controller.js";

const router = express.Router();


//all the routes related to the contents will be defined here
router.get("/search", searchContent);

export default router;