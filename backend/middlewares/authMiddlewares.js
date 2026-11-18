import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js"

// protected middleware >>
export const protect = catchAsync(async (req, res, next) => {
    // token
    let token;
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
            token = req.headers.authorization.split(" ")[1]
        }
        if(!token){
            return next(new AppError("You are not logged in, Please login!", 401))
        }

        // decode
        let decode;
        
        try {
        decode = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );
        } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(
            new AppError(
                "Your session has expired. Please wait while we verify your login.",
                401
            )
            );
        }

        if (error.name === "JsonWebTokenError") {
            return next(
            new AppError(
                "Your session is invalid. Please log in again.",
                401
            )
            );
        }

        throw error;
        }


    // customer
    const currentCustomer = await User.findById(decode.id) // imp
    if(!currentCustomer){
        return next(new AppError("You no more longger exist!, Please login!", 401))
    }


    // if customer accont is inactive it is exicutes
    if (!currentCustomer.isActive) {
        return next(
            new AppError("Your account is inactive.", 403)
        );
        }

    // if customer accont is block it is exicutes
    if (currentCustomer.status === "blocked") {
        return next(
            new AppError("Your account is blocked.", 403)
        );
    }

    req.user = currentCustomer;
    next()


})


// admin permissions >>
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role) ){
            return next(new AppError("Access Denied: You do not have a permission to perform this action", 403)) //imp
        }

    next() // imp for moving next operation
    }



}


