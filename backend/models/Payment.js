
import mongoose from "mongoose";
import crypto from "crypto";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    transactionRef: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    provider: {
      type: String,
      enum: ["razorpay", "stripe", "mock"],
      default: "mock",
      required: true,
    },

    providerOrderId: {
      type: String,
      default: undefined,
      trim: true,
    },

    providerPaymentId: {
      type: String,
      default: undefined,
      trim: true,
    },

    providerSignature: {
      type: String,
      default: null,
      select: false,
    },

    amountInPaise: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [1, "Payment amount must be greater than zero"],
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      enum: ["INR"],
    },

    method: {
      type: String,
      enum: [
        "card",
        "upi",
        "netbanking",
        "wallet",
        "emi",
        "paylater",
        "offline",
        "unknown",
      ],
      default: "unknown",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "authorized",
        "captured",
        "failed",
        "cancelled",
        "partially_refunded",
        "refunded",
      ],
      default: "pending",
      required: true,
    },

    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      trim: true,
    },

    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    failureCode: {
      type: String,
      default: null,
    },

    failureDescription: {
      type: String,
      default: null,
    },

    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },

    refundedAmountInPaise: {
      type: Number,
      default: 0,
      min: 0,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    capturedAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


// Generate a unique internal transaction reference
paymentSchema.pre("validate", function () {
  if (this.isNew && !this.transactionRef) {
    this.transactionRef = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }
});


// Prevent duplicate provider transactions
paymentSchema.index(
  { providerPaymentId: 1 },
  { unique: true, sparse: true }
);


paymentSchema.index(
  { providerOrderId: 1 },
  { unique: true, sparse: true }
);


paymentSchema.index({ order: 1, createdAt: -1 });
const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
