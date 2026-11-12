import Category from "../models/Category.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { query } from "express-validator";

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

    // Create category
    const category = await Category.create({
        name: name.trim(),
        description,
        image,
    });

    
    return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: {
        category,
        },
    });
});



// all categories >>
export const getAllCategories = catchAsync(async (req, res, next) => {

    const query = query.page

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
            data: {
            categories,
            pagination: {
                currentPage: page,
                limit,
                totalCategories,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            },
        });
});