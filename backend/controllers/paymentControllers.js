import Product from "../models/Product.js";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// SIMULATE PAYMENT
// ==========================================

export const simulatePayment = catchAsync(async (req, res, next) => {
  const { orderId, scenario, idempotencyKey } = req.body;
  const userId = req.user.id;

  //  Validate request
  if (!orderId || !scenario || !idempotencyKey) {
    return next(
      new AppError(
        "Order ID, payment scenario and idempotency key are required",
        400
      )
    );
  }

  if (!mongoose.isValidObjectId(orderId)) {
    return next(new AppError("Invalid order ID", 400));
  }

  if (!["success", "failure"].includes(scenario)) {
    return next(new AppError("Invalid payment scenario", 400));
  }

  if (
    typeof idempotencyKey !== "string" ||
    idempotencyKey.trim().length < 10 ||
    idempotencyKey.trim().length > 200
  ) {
    return next(new AppError("Invalid idempotency key", 400));
  }

  const key = idempotencyKey.trim();

  // Check previously processed request
  const existingPayment = await Payment.findOne({
    idempotencyKey: key,
  });

  if (existingPayment) {
    const sameRequest =
      existingPayment.user.toString() === userId.toString() &&
      existingPayment.order.toString() === orderId &&
      existingPayment.metadata?.scenario === scenario;

    if (!sameRequest) {
      return next(
        new AppError(
          "This idempotency key was already used for another payment request",
          409
        )
      );
    }

    return res.status(200).json({
      success: existingPayment.status === "captured",
      message: "This payment request has already been processed",
      data: {
        payment: existingPayment,
        duplicate: true,
      },
    });
  }

  // Start MongoDB session
  const session = await mongoose.startSession();

  let result;

  try {
    // Execute operations inside transaction
    await session.withTransaction(async () => {
      // Recheck idempotency inside transaction
      const duplicate = await Payment.findOne({
        idempotencyKey: key,
      }).session(session);

      if (duplicate) {
        const sameRequest =
          duplicate.user.toString() === userId.toString() &&
          duplicate.order.toString() === orderId &&
          duplicate.metadata?.scenario === scenario;

        if (!sameRequest) {
          throw new AppError("Invalid duplicate payment request", 409);
        }

        result = {
          duplicate: true,
          payment: duplicate,
        };

        return;
      }

      //  Find authenticated user's order
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
      }).session(session);

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      //  Validate order status
      if (order.orderStatus === "cancelled") {
        throw new AppError(
          "Payment cannot be processed for a cancelled order",
          400
        );
      }

      if (order.paymentStatus === "paid") {
        throw new AppError("This order has already been paid", 400);
      }

      //  Get server-calculated amount
      const amountInPaise = order.totalAmountInPaise;

      if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
        throw new AppError("Invalid order payment amount", 400);
      }

      //  Determine payment method
      const methodMap = {
        mock_card: "card",
        mock_upi: "upi",
      };

      const method = methodMap[order.paymentMethod] || "unknown";

      //  Calculate payment attempt number
      const previousAttempts = await Payment.countDocuments({
        order: order._id,
        user: userId,
      }).session(session);

      const isSuccessful = scenario === "success";

      //  Create payment record inside transaction
      const [payment] = await Payment.create(
        [
          {
            order: order._id,
            user: userId,
            provider: "mock",
            amountInPaise,
            currency: "INR",
            method,
            status: isSuccessful ? "captured" : "failed",
            idempotencyKey: key,
            attemptNumber: previousAttempts + 1,

            verifiedAt: isSuccessful ? new Date() : undefined,
            capturedAt: isSuccessful ? new Date() : undefined,

            failureCode: isSuccessful
              ? undefined
              : "PAYMENT_DECLINED",

            failureDescription: isSuccessful
              ? undefined
              : "The simulated payment was declined",

            metadata: {
              scenario,
              simulated: true,
            },
          },
        ],
        { session }
      );


// Update order and inventory inside the same transaction

if (isSuccessful) {

    // Deduct stock only after successful payment
    for (const item of order.items) {

        if (
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        ) {
            throw new AppError("Invalid order item quantity", 400);
        }

        // Atomically check stock and decrease it
        const updatedProduct = await Product.findOneAndUpdate(
            {
                _id: item.product,
                isActive: true,
                stock: { $gte: item.quantity },
            },
            {
                $inc: { stock: -item.quantity },
            },
            {
                new: true,
                session,
            }
        );

        // Stop transaction if product is unavailable or stock is insufficient
        if (!updatedProduct) {
            throw new AppError(
                `Insufficient stock or product unavailable: ${item.name}`,
                400
            );
        }
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.inventoryStatus = "committed";

} else {
    order.paymentStatus = "failed";
}

await order.save({ session });

      //  Prepare response
      result = {
        duplicate: false,
        success: isSuccessful,
        payment,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      };
    });

    //  Send response after transaction completes
    if (result.duplicate) {
      return res.status(200).json({
        success: result.payment.status === "captured",
        message: "This payment request has already been processed",
        data: {
          payment: result.payment,
          duplicate: true,
        },
      });
    }

    return res.status(200).json({
      success: result.success,
      message: result.success
        ? "Payment completed successfully"
        : "Payment failed. You can try again.",
      data: {
        payment: result.payment,
        order: result.order,
        duplicate: false,
      },
    });

  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const duplicatePayment = await Payment.findOne({
        idempotencyKey: key,
      });

      if (duplicatePayment) {
        const sameRequest =
          duplicatePayment.user.toString() === userId.toString() &&
          duplicatePayment.order.toString() === orderId &&
          duplicatePayment.metadata?.scenario === scenario;

        if (!sameRequest) {
          return next(
            new AppError("Invalid duplicate payment request", 409)
          );
        }

        return res.status(200).json({
          success: duplicatePayment.status === "captured",
          message: "This payment request has already been processed",
          data: {
            payment: duplicatePayment,
            duplicate: true,
          },
        });
      }
    }

    return next(error);

  } finally {
    //  Always close MongoDB session
    await session.endSession();
  }
});


// GET ORDER PAYMENT HISTORY
// ==========================================

export const getOrderPayments = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  if (!mongoose.isValidObjectId(orderId)) {
    return next(new AppError("Invalid order ID", 400));
  }

  // Verify order ownership
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Retrieve payment history
  const payments = await Payment.find({
    order: order._id,
    user: userId,
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    results: payments.length,
    data: {
      payments,
    },
  });
});
