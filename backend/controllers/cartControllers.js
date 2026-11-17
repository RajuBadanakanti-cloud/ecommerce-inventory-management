
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// Helper: Format cart response for frontend
const formatCartResponse = (cart) => {
    const items = cart.items
        .filter((item) => item.product && item.product.isActive)
        .map((item) => {
            const product = item.product;
            const unitPrice = product.priceInPaise;

            return {
                _id: item._id,
                product: {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    image: product.images?.[0] || null,
                    images: product.images || [],
                    sku: product.sku,
                    stock: product.stock,
                    isActive: product.isActive
                },
                quantity: item.quantity,
                unitPrice,
                itemTotal: unitPrice * item.quantity
            };
        });

    const itemCount = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = items.reduce(
        (total, item) => total + item.itemTotal,
        0
    );

    return {
        _id: cart._id,
        items,
        itemCount,
        subtotal
    };
};


// ADD PRODUCT TO CART
export const addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new AppError("Valid product ID is required", 400));
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        return next(new AppError("Quantity must be a positive integer", 400));
    }

    const product = await Product.findOne({
        _id: productId,
        isActive: true
    });

    if (!product) {
        return next(new AppError("Product not found or unavailable", 404));
    }

    if (product.stock < 1) {
        return next(new AppError("Product is out of stock", 400));
    }

    let cart = await Cart.findOne({
        user: req.user._id
    });

    if (!cart) {
        cart = new Cart({
            user: req.user._id,
            items: []
        });
    }

    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
    );

    const newQuantity = existingItem
        ? existingItem.quantity + quantity
        : quantity;

    if (newQuantity > product.stock) {
        return next(
            new AppError(
                `Only ${product.stock} units are available`,
                400
            )
        );
    }

    if (existingItem) {
        existingItem.quantity = newQuantity;
        existingItem.priceAtAdd = product.priceInPaise;
    } else {
        cart.items.push({
            product: product._id,
            quantity,
            priceAtAdd: product.priceInPaise
        });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
        path: "items.product",
        select: "name slug priceInPaise images stock sku isActive"
    });

    res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        cart: formatCartResponse(populatedCart)
    });
});


// GET USER CART
export const getCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({
        user: req.user._id
    }).populate({
        path: "items.product",
        select: "name slug priceInPaise images stock sku isActive"
    });

    if (!cart) {
        return res.status(200).json({
            success: true,
            message: "Your cart is empty",
            cart: {
                items: [],
                itemCount: 0,
                subtotal: 0
            }
        });
    }

    res.status(200).json({
        success: true,
        message: "Cart fetched successfully",
        cart: formatCartResponse(cart)
    });
});


//  UPDATE CART ITEM QUANTITY
export const updateCartQuantity = catchAsync(async (req, res, next) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return next(new AppError("Valid cart item ID is required", 400));
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        return next(new AppError("Quantity must be a positive integer", 400));
    }

    const cart = await Cart.findOne({
        user: req.user._id
    });

    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }

    const cartItem = cart.items.id(itemId);

    if (!cartItem) {
        return next(new AppError("Cart item not found", 404));
    }

    const product = await Product.findOne({
        _id: cartItem.product,
        isActive: true
    });

    if (!product) {
        return next(new AppError("Product is unavailable", 404));
    }

    if (quantity > product.stock) {
        return next(
            new AppError(
                `Only ${product.stock} units are available`,
                400
            )
        );
    }

    cartItem.quantity = quantity;
    cartItem.priceAtAdd = product.priceInPaise;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
        path: "items.product",
        select: "name slug priceInPaise images stock sku isActive"
    });

    res.status(200).json({
        success: true,
        message: "Cart quantity updated successfully",
        cart: formatCartResponse(populatedCart)
    });
});


// REMOVE SINGLE ITEM FROM CART
export const removeCartItem = catchAsync(async (req, res, next) => {
    const { itemId } = req.params;
    console.log("Remove itemId: ", itemId)

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return next(new AppError("Valid cart item ID is required", 400));
    }

    const cart = await Cart.findOne({
        user: req.user._id
    });

    if (!cart) {
        return next(new AppError("Cart not found", 404));
    }

    const cartItem = cart.items.id(itemId);

    if (!cartItem) {
        return next(new AppError("Cart item not found", 404));
    }

    cart.items.pull({
        _id: itemId
    });

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
        path: "items.product",
        select: "name slug priceInPaise images stock sku isActive"
    });

    res.status(200).json({
        success: true,
        message: "Product removed from cart successfully",
        cart: formatCartResponse(populatedCart)
    });
});


//  CLEAR ENTIRE CART
export const clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({
        user: req.user._id
    });

    if (!cart) {
        return res.status(200).json({
            success: true,
            message: "Cart is already empty",
            cart: {
                items: [],
                itemCount: 0,
                subtotal: 0
            }
        });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
        cart: {
            _id: cart._id,
            items: [],
            itemCount: 0,
            subtotal: 0
        }
    });
});
