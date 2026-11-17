
import express from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    hideCancelledOrder
} from "../controllers/orderControllers.js";

import {protect, restrictTo} from "../middlewares/authMiddlewares.js";

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Customer order routes
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);
router.patch("/:orderId/hide", hideCancelledOrder); // hide

// Admin order management route
router.patch("/:orderId/status", restrictTo("admin"), updateOrderStatus);

export default router;
