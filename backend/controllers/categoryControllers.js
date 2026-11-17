import Category from "../models/Category.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose"


// create category>>
export const createCategory = catchAsync(async (req, res, next) => {
    const { name, description, image } = req.body;

    // Validate required input
    if (!name || typeof name !== "string" || !name.trim()) {
        return next(new AppError("Category name is required", 400));
    }

    // Validate optional fields
    if (
        description !== undefined &&
        typeof description !== "string"
    ) {
        return next(new AppError("Invalid description", 400));
    }

    if (
        image !== undefined &&
        image !== null &&
        typeof image !== "string"
    ) {
        return next(new AppError("Invalid image URL", 400));
    }

    // bedore creating the category, check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
        return next(new AppError("Category with this name already exists", 400));
    }

    // Create category
    const category = await Category.create({
        name: name.trim(),
        description,
        image, // dummy image url
    });

    
    return res.status(201).json({
        success: true,
        message: "Category created successfully",
        category, // new category    
    });
});


// all categories >>
export const getAllCategories = catchAsync(async (req, res, next) => {

    const query = req.query || {};

    // pagination>>
        const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
        const limit = Math.min(
            50,
            Math.max(1, Number.parseInt(query.limit, 10) || 10)
        );

        const skip = (page - 1) * limit;

        const filter = { isActive: true };

        if (req.query.search?.trim()) {
            filter.name = {
            $regex: req.query.search.trim(),
            $options: "i",
            };
        }

        const [categories, totalCategories] = await Promise.all([
            Category.find(filter)
            .select("name slug description image createdAt")
            .sort({ name: 1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),

            Category.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalCategories / limit);

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            pagination: {
            currentPage: page,
            limit,
            totalCategories,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            },
            categories, // all categories list

        });
});

// update category >>
export const updateCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, image } = req.body;

    if (!mongoose.isValidObjectId(id)) {
        return next(new AppError("Invalid category ID", 400));
    }

    const existingCategory = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
    if (existingCategory) {
        return next(new AppError("Category with this name already exists", 400));
    }

    const category = await Category.findByIdAndUpdate(
        id,
        { $set: { name, description, image } },
        { new: true, runValidators: true }
    );

    if (!category) {
        return next(new AppError("Category not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category, // updated category
        
    });
});

// delete category >> 
export const deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    if(!mongoose.isValidObjectId(id)){
        return next(new AppError("Invalid category ID", 400));
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        return next(new AppError("Category not found", 404));
    }

    return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        category:{
            name:category.name
        } // deleted category name
    });
});