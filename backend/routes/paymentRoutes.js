
import express from "express";
import {
  simulatePayment,
  getOrderPayments,
} from "../controllers/paymentControllers.js";

import {protect} from "../middlewares/authMiddlewares.js";


const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Process a payment simulation
router.post("/simulate", simulatePayment);

// Get payment history for a specific order
router.get("/order/:orderId", getOrderPayments);

export default router;
