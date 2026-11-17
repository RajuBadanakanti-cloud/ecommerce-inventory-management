import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: 2000,
    },

    priceInPaise: {
      type: Number,
      required: [true, "Product price is required"],
      min: 1,
    },

    compareAtPriceInPaise: {
      type: Number,
      min: 0,
      default: null,
    },

    // 
    category: {
      type: mongoose.Schema.Types.ObjectId, // relationship with Category model - imp
      ref: "Category",
      required: [true, "Product category is required"],
    },

    images: {
      type: [String],
      default: [],
    },

    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Generate slug from product name
productSchema.pre("validate", function () {
  if (this.isNew && this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;