import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            trim: true,
            uppercase: true,
            minlength: 3,
            maxlength: 30
        },

        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            required: [true, "Discount type is required"]
        },

        discountValue: {
            type: Number,
            required: [true, "Discount value is required"],
            min: 1
        },

        // Minimum order amount in paise
        minOrderAmountInPaise: {
            type: Number,
            default: 0,
            min: 0
        },

        // Maximum discount in paise. 0 means no cap.
        maxDiscountInPaise: {
            type: Number,
            default: 0,
            min: 0
        },

        expiryDate: {
            type: Date,
            required: [true, "Expiry date is required"]
        },

        usageLimit: {
            type: Number,
            required: [true, "Usage limit is required"],
            min: 1
        },

        usedCount: {
            type: Number,
            default: 0,
            min: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Validate discount value
couponSchema.pre("validate", function () {
    if (
        this.discountType === "percentage" &&
        this.discountValue > 100
    ) {
        this.invalidate(
            "discountValue",
            "Percentage discount cannot exceed 100"
        );
    }
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
