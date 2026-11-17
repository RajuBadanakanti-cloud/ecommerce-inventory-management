
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";

// get inventory >>
export const getInventory = catchAsync(async (req, res, next) => {
  const products = await Product.find()
    .populate("category", "name")
    .select("name sku category images stock lowStockThreshold isActive")
    .sort({ updatedAt: -1 });

  const inventory = products.map((product) => {
    let status = "in_stock";

    if (product.stock === 0) {
      status = "out_of_stock";
    } else if (product.stock <= product.lowStockThreshold) {
      status = "low_stock";
    }

    return {
      _id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category?.name || "Uncategorized",
      image: product.images?.[0] || "",
      stock: product.stock,
      reorderThreshold: product.lowStockThreshold,
      status,
    };
  });

  res.status(200).json({
    status: "success",
    results: inventory.length,
    data: inventory,
  });
});



// GET inventory movements with pagenation
export const getInventoryMovements = catchAsync(async (req, res, next) => {
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 15, 1),
    100
  );

  const movements = await InventoryMovement.find()
    .populate("product", "name sku")
    .populate("performedBy", "name")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    status: "success",
    results: movements.length,
    data: movements,
  });
});



// POST inventory adjustments
export const adjustInventory = catchAsync(async (req, res, next) => {
  const { changeQuantity, reason } = req.body;
  const { id } = req.params;

  // Validate quantity
  if (
    !Number.isSafeInteger(changeQuantity) ||
    changeQuantity === 0
  ) {
    return next(
      new AppError("Stock change must be a non-zero integer", 400)
    );
  }

  // Validate reason
  if (!reason || !reason.trim()) {
    return next(
      new AppError("Adjustment reason is required", 400)
    );
  }

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("Invalid product ID", 400));
  }

  const session = await mongoose.startSession();

  try {
    let updatedProduct;
    let movement;

    await session.withTransaction(async () => {
      const product = await Product.findById(id).session(session);

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const previousStock = product.stock;
      const newStock = previousStock + changeQuantity;

      if (newStock < 0) {
        throw new AppError("Insufficient stock", 400);
      }

      product.stock = newStock;
      await product.save({ session });

      const [createdMovement] = await InventoryMovement.create(
        [
          {
            product: product._id,
            changeQuantity,
            previousStock,
            newStock,
            movementType: changeQuantity > 0 ? "IN" : "OUT",
            reason: reason.trim(),
            performedBy: req.user._id,
          },
        ],
        { session }
      );

      updatedProduct = product;
      movement = createdMovement;
    });

    res.status(200).json({
      status: "success",
      message: "Inventory adjusted successfully",
      data: {
        product: updatedProduct,
        movement,
      },
    });
  } finally {
    await session.endSession();
  }
});
