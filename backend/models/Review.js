
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Verified purchase order is required"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number",
      },
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [5, "Review must contain at least 5 characters"],
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// One review per user per product
reviewSchema.index(
  { product: 1, user: 1 },
  { unique: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
