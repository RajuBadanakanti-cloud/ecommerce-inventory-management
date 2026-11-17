
import mongoose from "mongoose";

// items only >>
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },

    // Price snapshot when the item is added
    priceAtAdd: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

// cartSchema represents a user's shopping cart, 
// which contains multiple cart items. 
// Each cart item references a product and has a quantity and price snapshot.
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema], // cart items are embedded as subdocuments
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
