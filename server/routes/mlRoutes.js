import express from "express";
import { predictDrug, predictRisk } from "../controllers/mlController.js";

const router = express.Router();

router.post("/risk", predictRisk);
router.post("/drug", predictDrug);

export default router;

