
import express from "express";

import {
  createReview,
  getProductReviews,
} from "../controllers/reviewControllers.js";

import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// Product Reviews
router.route("/product/:id").get(getProductReviews) // getting user reviews

router.route("/product/:id").post(protect, createReview); // post reviews

export default router;
