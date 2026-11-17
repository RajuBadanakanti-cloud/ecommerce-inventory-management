import Product from "../models/Product.js";
import Category from "../models/Category.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js"
import mongoose from "mongoose"



export const getAllProducts = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    sort = "newest",
  } = req.query;

  // Pagination
  const currentPage = Math.max(
    1,
    Number.parseInt(page, 10) || 1
  );

  const pageLimit = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 10)
  );

  const skip = (currentPage - 1) * pageLimit;

  // Product filter
  const filter = {};

  // Admin can view all products.
  // Customers and public users can view active products only.
  if (req.user?.role !== "admin") {
    filter.isActive = true;
  }

  // Search by product name
  if (search?.trim()) {
    filter.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.priceInPaise = {};

    if (minPrice !== undefined) {
      filter.priceInPaise.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filter.priceInPaise.$lte = Number(maxPrice);
    }
  }

  // Sorting
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priceLowToHigh: { priceInPaise: 1 },
    priceHighToLow: { priceInPaise: -1 },
    nameAZ: { name: 1 },
    nameZA: { name: -1 },
  };

  const sortBy = sortOptions[sort] || sortOptions.newest;

  // Fetch products and total count
  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortBy)
      .skip(skip)
      .limit(pageLimit),

    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalProducts / pageLimit);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    pagination: {
      currentPage,
      limit: pageLimit,
      totalProducts,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
    products,
  });
});


// create a new post
export const createProduct = catchAsync(async (req, res, next) => {
  const {
    name,
    sku,
    description,
    category,
    price,
    discountPrice,
    stock,
    reorderThreshold,
    images,
  } = req.body;

  // Required field validation
  if (
    !name?.trim() ||
    !sku?.trim() ||
    !description?.trim() ||
    !category ||
    price === undefined ||
    stock === undefined
  ) {
    return next(
      new AppError("Please provide all required product fields", 400)
    );
  }

  // Validate category ID
  if (!mongoose.isValidObjectId(category)) {
    return next(new AppError("Invalid category ID", 400));
  }

  // Check whether category exists
  const existingCategory = await Category.findById(category);

  if (!existingCategory) {
    return next(new AppError("Category not found", 404));
  }

  // Validate price
  const productPrice = Number(price);

  if (!Number.isFinite(productPrice) || productPrice <= 0) {
    return next(new AppError("Product price must be greater than zero", 400));
  }

  // Validate discount price
  const salePrice =
    discountPrice === undefined ||
    discountPrice === null ||
    discountPrice === ""
      ? null
      : Number(discountPrice);

  if (
    salePrice !== null &&
    (!Number.isFinite(salePrice) ||
      salePrice <= 0 ||
      salePrice >= productPrice)
  ) {
    return next(
      new AppError(
        "Discount price must be greater than zero and less than original price",
        400
      )
    );
  }

  // Validate stock and low stock threshold
  const initialStock = Number(stock);
  const lowStockThreshold = Number(reorderThreshold ?? 5);

  if (!Number.isSafeInteger(initialStock) || initialStock < 0) {
    return next(
      new AppError("Stock must be a non-negative integer", 400)
    );
  }

  if (
    !Number.isSafeInteger(lowStockThreshold) ||
    lowStockThreshold < 0
  ) {
    return next(
      new AppError("Low stock threshold must be a non-negative integer", 400)
    );
  }

  // Validate images
  const productImages =
    images === undefined
      ? []
      : Array.isArray(images)
        ? images
        : null;

  if (
    productImages === null ||
    !productImages.every(
      (image) => typeof image === "string" && image.trim().length > 0
    )
  ) {
    return next(new AppError("Invalid product images", 400));
  }

  //  Check duplicate SKU
  const normalizedSKU = sku.trim().toUpperCase();

  const existingProduct = await Product.findOne({
    sku: normalizedSKU,
  });

  if (existingProduct) {
    return next(new AppError("Product SKU already exists", 409));
  }

  // Create product
  const product = await Product.create({
    name: name.trim(),
    sku: normalizedSKU,
    description: description.trim(),
    category,
    priceInPaise: Math.round(
      (salePrice ?? productPrice) * 100
    ),
    compareAtPriceInPaise:
      salePrice !== null
        ? Math.round(productPrice * 100)
        : null,
    stock: initialStock,
    lowStockThreshold,
    images: productImages.map((image) => image.trim()),
  });

  // Populate category
  await product.populate("category", "name slug");

  // Send response
  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});



// product details by id
export const getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return next(new AppError("Invalid product ID", 400));
    }

    // Find active product
    const product = await Product.findOne({
        _id: id,
        isActive: true
    })
        .populate("category", "name slug")
        .lean();

    // Check product existence
    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    // Send response
    return res.status(200).json({
        success: true,
        message: "Product fetched successfully",    
        product
        
    });
});


// update product by id 
export const updateProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return next(new AppError("Invalid product ID", 400));
    }

    // Find and update the product
    const updatedProduct = await Product.findOneAndUpdate(
        { _id: id, isActive: true },
        updateData,
        { new: true, runValidators: true }
    ).populate("category", "name slug");

    // Check if the product was found and updated
    if (!updatedProduct) {
        return next(new AppError("Product not found or not active", 404));
    }

    // Send response
    return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct
    });
})


// delete product by id
export const deleteProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return next(new AppError("Invalid product ID", 400));
    }   
    
    // Find and delete the product
    const deletedProduct = await Product.findOneAndDelete({
        _id: id,
        isActive: true
    });

    // Check if the product was found and deleted
    if (!deletedProduct) {
        return next(new AppError("Product not found or not active", 404));
    }

    // Send response
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        product: deletedProduct
    });
});