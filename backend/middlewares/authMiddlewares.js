import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import User from "../model/User.js"

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
    decode = await jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    if(!decode){
        return next(new AppError("Your login failed or token expired!", 401))
    }

    // customer
    const currentCustomer = await User.findById(decode.id) // imp
    if(!currentCustomer){
        return next(new AppError("You no more longger exist!, Please login!", 401))
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
export const redirectTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role) ){
            return next(new AppError("Access Denied: You do not have a permission to perform this action", 403)) //imp
        }

    next() // imp for moving next operation
    }

   

}


