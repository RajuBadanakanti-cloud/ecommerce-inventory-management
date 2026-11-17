
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

    // CREATE PRODUCT REVIEW
export const createReview = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        // Validate product ID
        if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID",
        });
        }

        // Validate rating
        if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5",
        });
        }

        // Validate comment
        if (!comment || comment.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: "Review must contain at least 5 characters",
        });
        }

        // Verify delivered and paid order containing this product
        const deliveredOrder = await Order.findOne({
        user: userId,
        orderStatus: "delivered",
        paymentStatus: "paid",
        "items.product": productId,
        });

        if (!deliveredOrder) {
        return res.status(403).json({
            success: false,
            message: "You can review this product only after a delivered purchase",
        });
        }

        // Prevent duplicate reviews
        const existingReview = await Review.findOne({
        product: productId,
        user: userId,
        });

        if (existingReview) {
        return res.status(409).json({
            success: false,
            message: "You have already reviewed this product",
        });
        }

        // Create review
        const review = await Review.create({
        product: productId,
        user: userId,
        order: deliveredOrder._id,
        rating: Number(rating),
        comment: comment.trim(),
        });

        return res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        review,
        });
    } catch (error) {
        if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "You have already reviewed this product",
        });
        }

        return res.status(500).json({
        success: false,
        message: "Failed to submit review",
        });
    }
    };


    // GET PRODUCT REVIEWS
export const getProductReviews = async (req, res) => {
    try {
        const { id: productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID",
        });
        }

        const reviews = await Review.find({ product: productId })
        .populate("user", "name")
        .sort({ createdAt: -1 });

        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: "Failed to fetch reviews",
        });
    }
    };
