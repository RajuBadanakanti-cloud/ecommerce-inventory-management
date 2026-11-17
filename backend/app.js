import express from "express"
import dotenv from "dotenv"
dotenv.config()
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js"
import inventoryRoutes from "./routes/inventoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";




import errorMiddleware from "./middlewares/globalErrorMid.js"

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
})) // frontend link here
connectDB() // mongodb connected
app.use(cookieParser());


app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/category", categoryRoutes) // category
app.use("/api/product", productRoutes) // products
app.use("/api/cart", cartRoutes) // cart
app.use("/api/orders", orderRoutes); // order
app.use("/api/payments", paymentRoutes); // payment
app.use("/api/reviews", reviewRoutes); // reviews

// Admin Access >>
app.use("/api/analytics", analyticsRoutes); // dashboard
app.use("/api/inventory", inventoryRoutes); // inventory
app.use("/api/coupons", couponRoutes); // coupons




app.get("/", (req, res, next) => {
    return res.send("<h1>Qveto-ecommerce-inventory-management</h1>")
})


app.use(errorMiddleware) // gloabl error middleware handler


export default app

