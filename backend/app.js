import express from "express"
import dotenv from "dotenv"
dotenv.config()
import helmet from "helmet"
import cors from "cors"
import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"

import errorMiddleware from "./middlewares/globalErrorMid.js"

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cors()) // frontend link here
connectDB() // mongodb connected

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)



app.get("/", (req, res, next) => {
    return res.send("<h1>Qveto-ecommerce-inventory-management</h1>")
})


app.use(errorMiddleware) // gloabl error middleware handler


export default app

