
import express from "express";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    hideCancelledOrder
} from "../controllers/orderControllers.js";

import { protect, restrictTo } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Admin order management routes
router.route("/").get(restrictTo("admin"), getAllOrders);
router.put("/:orderId/status", restrictTo("admin"), updateOrderStatus);

// Customer order routes
router.route("/").post(createOrder);
router.route("/my-orders").get(getMyOrders);
router.route("/:orderId").get( getOrderById);
router.route("/:orderId/cancel").patch(cancelOrder);
router.route("/:orderId/hide").patch(hideCancelledOrder);

export default router;
