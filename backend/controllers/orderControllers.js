import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";



// Create a new order from the authenticated user's cart
export const createOrder = catchAsync(async (req, res, next) => {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    //console.log("CREATE ORDER API HIT");
   // console.log("Request Body:", req.body);
    // console.log("Payment Method:", req.body.paymentMethod);

    // Validate the shipping address
    const requiredAddressFields = [
        "fullName",
        "phone",
        "addressLine1",
        "city",
        "state",
        "postalCode",
        "country"
    ];

    for (const field of requiredAddressFields) {
        if (!shippingAddress?.[field]?.toString().trim()) {
            return next(
                new AppError(`${field} is required in shipping address`, 400)
            );
        }
    }

    // Validate the selected payment method
    const allowedPaymentMethods = [
        "card",
        "upi",
       // "netbanking",
        //"wallet",
       // "emi",
       // "paylater",
        "offline",
       // "unknown",
      ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
        return next(new AppError("Invalid payment method", 400));
    }

    // Fetch the authenticated user's cart
    const cart = await Cart.findOne({
        user: req.user._id
    }).populate({
        path: "items.product",
        select: "name priceInPaise images sku stock isActive"
    });

    if (!cart || cart.items.length === 0) {
        return next(new AppError("Your cart is empty", 400));
    }

    let subtotalInPaise = 0;

    // Validate products and prepare order item snapshots
    const orderItems = [];

    for (const item of cart.items) {
        const product = item.product;

        if (!product || !product.isActive) {
            return next(
                new AppError("One or more products are unavailable", 400)
            );
        }

        if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        ) {
            return next(new AppError("Invalid product quantity", 400));
        }

        if (product.stock < item.quantity) {
            return next(
                new AppError(
                    `Insufficient stock for ${product.name}. Available stock: ${product.stock}`,
                    400
                )
            );
        }

        const unitPriceInPaise = product.priceInPaise;
        const itemTotalInPaise = unitPriceInPaise * item.quantity;

        if (!Number.isSafeInteger(itemTotalInPaise)) {
            return next(new AppError("Invalid product amount", 400));
        }

        subtotalInPaise += itemTotalInPaise;

        orderItems.push({
            product: product._id,
            name: product.name,
            image: product.images?.[0] || null,
            sku: product.sku,
            quantity: item.quantity,
            unitPriceInPaise,
            itemTotalInPaise
        });
    }

    if (!Number.isSafeInteger(subtotalInPaise)) {
        return next(new AppError("Invalid order subtotal", 400));
    }

    // COUPON VALIDATION
    let discountInPaise = 0;
    let appliedCouponCode = null;

    if (couponCode?.trim()) {
        const normalizedCode = couponCode.trim().toUpperCase();

        const coupon = await Coupon.findOne({
            code: normalizedCode
        });

        if (!coupon) {
            return next(new AppError("Invalid coupon code", 404));
        }

        if (!coupon.isActive) {
            return next(new AppError("This coupon is inactive", 400));
        }

        if (coupon.expiryDate <= new Date()) {
            return next(new AppError("This coupon has expired", 400));
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return next(new AppError("Coupon usage limit reached", 400));
        }

        if (subtotalInPaise < coupon.minOrderAmountInPaise) {
            return next(
                new AppError(
                    `Minimum order amount is ₹${coupon.minOrderAmountInPaise / 100}`,
                    400
                )
            );
        }

        // Calculate discount
        if (coupon.discountType === "percentage") {
            discountInPaise = Math.round(
                (subtotalInPaise * coupon.discountValue) / 100
            );
        } else if (coupon.discountType === "flat") {
            discountInPaise = Math.round(
                coupon.discountValue * 100
            );
        }

        // Apply maximum discount limit
        if (
            coupon.maxDiscountInPaise > 0 &&
            discountInPaise > coupon.maxDiscountInPaise
        ) {
            discountInPaise = coupon.maxDiscountInPaise;
        }

        // Discount cannot exceed subtotal
        discountInPaise = Math.min(
            discountInPaise,
            subtotalInPaise
        );

        appliedCouponCode = coupon.code;
    }

    // Calculate order totals on the server
    const shippingFeeInPaise = 0;

    const taxInPaise = Math.round(
        (subtotalInPaise - discountInPaise) * 0.05
    );

    const totalAmountInPaise =
        subtotalInPaise -
        discountInPaise +
        shippingFeeInPaise +
        taxInPaise;

    // Create the order
    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        subtotalInPaise,
        discountInPaise,
        shippingFeeInPaise,
        taxInPaise,
        totalAmountInPaise,
        couponCode: appliedCouponCode,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending"
    });

    res.status(201).json({
        success: true,
        message: "Order created successfully",
        ...order.toObject()
    });
});



// Get all visible orders belonging to the authenticated user
export const getMyOrders = catchAsync(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit, 10) || 10)
  );

  const skip = (page - 1) * limit;

      const filter = {
        user: req.user._id,
        isHidden: { $ne: true },
    };

  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: orders.length,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      limit,
    },
    orders,
  });
});


// Get a single order belonging to the authenticated user
export const getOrderById = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new AppError("Invalid order ID", 400));
    }

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id
    });

    if (!order) {
        return next(new AppError("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        order
    });
});



// Update order status from the admin side
export const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    // Accept status from frontend
    const orderStatus = req.body.status;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new AppError("Invalid order ID", 400));
    }

    const allowedStatuses = [
        "confirmed",
        "processing",
        "shipped",
        "delivered"
    ];

    if (!allowedStatuses.includes(orderStatus)) {
        return next(new AppError("Invalid order status", 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError("Order not found", 404));
    }

    // Payment must be completed before fulfillment
    if (order.paymentStatus !== "paid") {
        return next(
            new AppError(
                "Payment must be completed before fulfillment",
                400
            )
        );
    }

    // Allowed order status transitions
    const allowedTransitions = {
        pending: ["confirmed"],
        confirmed: ["processing"],
        processing: ["shipped"],
        shipped: ["delivered"],
        delivered: [],
        cancelled: []
    };

    if (!allowedTransitions[order.orderStatus]?.includes(orderStatus)) {
        return next(
            new AppError(
                `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
                400
            )
        );
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order
    });
});


// Cancel an unpaid order belonging to the authenticated user
export const cancelOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new AppError("Invalid order ID", 400));
    }

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
    });

    if (!order) {
        return next(new AppError("Order not found", 404));
    }

    if (order.orderStatus === "cancelled") {
        return next(new AppError("Order is already cancelled", 400));
    }

    // Paid orders require a separate cancellation and refund workflow
    if (
        order.paymentStatus === "paid" ||
        order.orderStatus !== "pending"
    ) {
        return next(
        new AppError(
            "This order cannot be cancelled through this endpoint",
            400
        )
        );
    }

    order.orderStatus = "cancelled";

    await order.save();

    res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        order,
    });
});



// Hide a cancelled order from the customer's My Orders list
export const hideCancelledOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(new AppError("Invalid order ID", 400));
    }

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
    });

    if (!order) {
        return next(new AppError("Order not found", 404));
    }

    if (order.orderStatus !== "cancelled") {
        return next(
        new AppError(
            "Only cancelled orders can be removed from My Orders",
            400
        )
        );
    }

    if (order.isHidden) {
        return next(
        new AppError("Order is already removed from My Orders", 400)
        );
    }

    order.isHidden = true;

    await order.save();

    res.status(200).json({
        success: true,
        message: "Cancelled order removed from My Orders successfully",
        order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        isHidden: order.isHidden,
        },
    });
    });



// Admin Access only
export const getAllOrders = catchAsync(async (req, res, next) => {
    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    // Fetch orders and total count
    const [orders, totalOrders] = await Promise.all([
        Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Order.countDocuments()
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
        success: true,
        results: orders.length,
        pagination: {
            currentPage: page,
            limit,
            totalOrders,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        },
        orders
    });
});
