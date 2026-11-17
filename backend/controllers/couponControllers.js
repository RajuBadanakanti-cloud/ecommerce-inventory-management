import Coupon from "../models/Coupon.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// GET ALL COUPONS
export const getAllCoupons = catchAsync(async (req, res, next) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    // Convert paise into rupees for frontend
    const formattedCoupons = coupons.map((coupon) => ({
        ...coupon.toObject(),
        minOrderAmount: coupon.minOrderAmountInPaise / 100,
        maxDiscount: coupon.maxDiscountInPaise / 100
    }));

    res.status(200).json({
        success: true,
        results: formattedCoupons.length,
        coupons: formattedCoupons
    });
});


// CREATE COUPON
export const createCoupon = catchAsync(async (req, res, next) => {
    const {
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        expiryDate,
        usageLimit
    } = req.body;

    if (
        !code ||
        !discountType ||
        discountValue === undefined ||
        !expiryDate ||
        usageLimit === undefined
    ) {
        return next(new AppError("Please provide all required coupon fields", 400));
    }

    const normalizedCode = code.trim().toUpperCase();

    if (!/^[A-Z0-9_-]{3,30}$/.test(normalizedCode)) {
        return next(new AppError("Coupon code must be 3-30 characters and contain only letters, numbers, _ or -", 400));
    }

    if (!["percentage", "flat"].includes(discountType)) {
        return next(new AppError("Invalid discount type", 400));
    }

    if (!Number.isFinite(Number(discountValue)) || Number(discountValue) <= 0) {
        return next(new AppError("Discount value must be greater than zero", 400));
    }

    if (discountType === "percentage" && Number(discountValue) > 100) {
        return next(new AppError("Percentage discount cannot exceed 100", 400));
    }

    const minAmount = Number(minOrderAmount ?? 0);
    const maxAmount = Number(maxDiscount ?? 0);
    const limit = Number(usageLimit);
    const expiry = new Date(expiryDate);

    if (
        !Number.isFinite(minAmount) ||
        minAmount < 0 ||
        !Number.isFinite(maxAmount) ||
        maxAmount < 0 ||
        !Number.isSafeInteger(limit) ||
        limit < 1
    ) {
        return next(new AppError("Invalid minimum amount, maximum discount, or usage limit", 400));
    }

    if (
        discountType === "flat" &&
        !Number.isSafeInteger(Math.round(Number(discountValue) * 100))
    ) {
        return next(new AppError("Invalid flat discount amount", 400));
    }

    if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
        return next(new AppError("Expiry date must be in the future", 400));
    }

    const existingCoupon = await Coupon.findOne({ code: normalizedCode });

    if (existingCoupon) {
        return next(new AppError("Coupon code already exists", 409));
    }

    const coupon = await Coupon.create({
        code: normalizedCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmountInPaise: Math.round(minAmount * 100),
        maxDiscountInPaise: Math.round(maxAmount * 100),
        expiryDate: expiry,
        usageLimit: limit
    });

    res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        coupon
    });
});


// DELETE COUPON
export const deleteCoupon = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!/^[a-f\d]{24}$/i.test(id)) {
        return next(new AppError("Invalid coupon ID", 400));
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
        return next(new AppError("Coupon not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Coupon deleted successfully"
    });
});


// VALIDATE COUPON
export const validateCoupon = catchAsync(async (req, res, next) => {
    const { code } = req.params;
    const subtotal = Number(req.query.subtotal);

    // Validate subtotal
    if (
        !Number.isSafeInteger(subtotal) ||
        subtotal <= 0
    ) {
        return next(new AppError("Invalid order subtotal", 400));
    }

    // Find coupon
    const coupon = await Coupon.findOne({
        code: code.trim().toUpperCase()
    });

    if (!coupon) {
        return next(new AppError("Invalid coupon code", 404));
    }

    // Check active status
    if (!coupon.isActive) {
        return next(new AppError("This coupon is inactive", 400));
    }

    // Check expiry
    if (coupon.expiryDate <= new Date()) {
        return next(new AppError("This coupon has expired", 400));
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
        return next(new AppError("Coupon usage limit reached", 400));
    }

    // Check minimum order amount
    if (subtotal < coupon.minOrderAmountInPaise) {
        return next(
            new AppError(
                `Minimum order amount is ₹${coupon.minOrderAmountInPaise / 100}`,
                400
            )
        );
    }

    // Calculate discount in paise
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
        discountAmount = Math.round(
            (subtotal * coupon.discountValue) / 100
        );
    } else if (coupon.discountType === "flat") {
        discountAmount = Math.round(
            coupon.discountValue * 100
        );
    }

    // Apply maximum discount cap
    if (
        coupon.maxDiscountInPaise > 0 &&
        discountAmount > coupon.maxDiscountInPaise
    ) {
        discountAmount = coupon.maxDiscountInPaise;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    res.status(200).json({
        success: true,
        message: "Coupon applied successfully",
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount
    });
});


// Active COUPONS >>
export const getActiveCoupons = catchAsync(async (req, res, next) => {
    const coupons = await Coupon.find({
        isActive: true,
        expiryDate: { $gt: new Date() },
        $expr: {
            $lt: [
                { $ifNull: ["$usedCount", 0] },
                "$usageLimit"
            ]
        }
    })
    .select(
        "code discountType discountValue minOrderAmountInPaise maxDiscountInPaise expiryDate"
    )
    .sort({ createdAt: -1 });

    const formattedCoupons = coupons.map((coupon) => ({
        ...coupon.toObject(),
        minOrderAmount: coupon.minOrderAmountInPaise / 100,
        maxDiscount: coupon.maxDiscountInPaise / 100
    }));

    res.status(200).json({
        success: true,
        results: formattedCoupons.length,
        coupons: formattedCoupons
    });
});
