
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

// Error middleware
import errorMiddleware from "./middlewares/globalErrorMid.js";

const app = express();

// Trust Render's reverse proxy for correct client IP detection.
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Limit incoming JSON request size
app.use(express.json({ limit: "1mb" }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Parse cookies
app.use(cookieParser());

// Connect MongoDB
connectDB();

// Login rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Maximum 10 failed attempts
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Apply rate limiting only to login
app.use("/api/auth/login", loginLimiter);

// Authentication routes
app.use("/api/auth", authRoutes);

// Other application routes
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

// Admin routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/coupons", couponRoutes);

// Root route
app.get("/", (req, res) => {
  return res.send("<h1>Qveto-ecommerce-inventory-management</h1>");
});

// Global error middleware (must remain last)
app.use(errorMiddleware);

export default app;
