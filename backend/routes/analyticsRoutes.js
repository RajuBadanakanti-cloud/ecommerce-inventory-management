import express from "express";

import { getDashboardAnalytics } from "../controllers/analyticsController.js";
import {
    protect,
    restrictTo,
} from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Only authenticated admins can access dashboard analytics
router.get("/dashboard", protect, restrictTo("admin"), getDashboardAnalytics);


export default router;
