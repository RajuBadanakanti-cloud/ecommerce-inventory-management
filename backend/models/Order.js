import mongoose from "mongoose";
import crypto from "crypto";

// Order Item Schema >>>>>>>>>>>>>>>>>>>>
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: null,
    },

    sku: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPriceInPaise: {
      type: Number,
      required: true,
      min: 0,
    },

    itemTotalInPaise: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

// Shipping Address Schema >>>>>>>>>>>>>>>>>>>>
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      default: "India",
    },
  },
  { _id: false }
);

//  Main Order Schema >>>>>>>>>>>>>>>
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one product",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    subtotalInPaise: {
      type: Number,
      required: true,
      min: 0,
    },

    discountInPaise: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingFeeInPaise: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxInPaise: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmountInPaise: {
      type: Number,
      required: true,
      min: 0,
    },

    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    paymentMethod: {
      type: String,
      enum: ["mock_card", "mock_upi"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    inventoryStatus: {
    type: String,
    enum: ["not_reserved", "reserved", "committed", "released"],
    default: "not_reserved",
    },

    isHidden: {
  type: Boolean,
  default: false,
},

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//  Generate Unique Order Number
orderSchema.pre("validate", function () {
  if (this.isNew && !this.orderNumber) {
    const uniqueId = crypto.randomBytes(4).toString("hex").toUpperCase();

    this.orderNumber = `ORD-${Date.now()}-${uniqueId}`;
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
