import express from "express";

import {
    getAllCoupons,
    createCoupon,
    deleteCoupon,
    validateCoupon,
    getActiveCoupons
} from "../controllers/couponControllers.js";

import {
    protect,
    restrictTo
} from "../middlewares/authMiddlewares.js";

const router = express.Router();

// active - coupons for public >>>
router.route("/active").get(getActiveCoupons);

// Customer coupon validation
router.route("/validate/:code").get(protect, validateCoupon);

// All coupon routes require Admin authentication
router.use(protect, restrictTo("admin"))

router.route("/").get( getAllCoupons)// GET all coupons
router.route("/").post(createCoupon);// CREATE coupon
router.route("/:id").delete(deleteCoupon)// DELETE coupon

export default router;
