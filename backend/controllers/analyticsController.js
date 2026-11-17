
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";

export const getDashboardAnalytics = catchAsync(
  async (req, res, next) => {

    // 1. Calculate dashboard statistics
    const [
      totalRevenueResult,
      totalOrders,
      paidOrders,
      totalProducts,
      totalCustomers,
      lowStockCount,
      recentOrders,
      topProducts,
    ] = await Promise.all([

      // Total revenue from successful payments
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmountInPaise" },
          },
        },
      ]),

      // Total orders
      Order.countDocuments(),

      // Successful paid orders
      Order.countDocuments({
        paymentStatus: "paid",
      }),

      // Active products
      Product.countDocuments({
        isActive: true,
      }),

      // Active customers
      User.countDocuments({
        role: "customer",
        isActive: true,
      }),

      // Low stock products
      Product.countDocuments({
        isActive: true,
        $expr: {
          $lte: ["$stock", "$lowStockThreshold"],
        },
      }),

      // Latest 5 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .select("orderNumber user totalAmountInPaise orderStatus createdAt"),

      // Top selling products from paid orders
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            totalSold: { $sum: "$items.quantity" },
            totalRevenueInPaise: {
              $sum: "$items.itemTotalInPaise",
            },
          },
        },
        {
          $sort: {
            totalSold: -1,
          },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            totalSold: 1,
            totalRevenue: {
              $divide: ["$totalRevenueInPaise", 100],
            },
          },
        },
      ]),
    ]);

    // Convert paise into rupees
    const totalRevenue =
      (totalRevenueResult[0]?.total || 0) / 100;

    const formattedRecentOrders = recentOrders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      user: order.user,
      totalAmount: order.totalAmountInPaise / 100,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    }));

    res.status(200).json({
      success: true,
      totalRevenue,
      totalOrders,
      paidOrders,
      totalProducts,
      totalCustomers,
      lowStockCount,
      recentOrders: formattedRecentOrders,
      topProducts,
    });
  }
);
