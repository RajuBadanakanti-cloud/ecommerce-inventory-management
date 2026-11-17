import Product from "../models/Product.js";
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
        sort = "newest"
    } = req.query;

    // Pagination
    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));

    const skip = (currentPage - 1) * pageLimit;

    // MongoDB filter
    const filter = {
        isActive: true
    };

    // Search by product name
    if (search?.trim()) {
        filter.name = {
            $regex: search.trim(),
            $options: "i"
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



    //  Sorting
    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        priceLowToHigh: { priceInPaise: 1 },
        priceHighToLow: { priceInPaise: -1 },
        nameAZ: { name: 1 },
        nameZA: { name: -1 }
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    // getting products and total count
    const products = await Product.find(filter)
            .populate("category", "name slug")
            .sort(sortBy)
            .skip(skip)
            .limit(pageLimit)

    // Total pages
    const totalProducts = products.length
    const totalPages = Math.ceil(totalProducts / pageLimit);



// response to fronted
    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        pagination: {
            currentPage,
            limit: pageLimit,
            totalProducts,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
        },
        products
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