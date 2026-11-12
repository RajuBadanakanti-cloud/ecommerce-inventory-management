import User from "../model/User.js"
import catchAsync from "../utils/catchAsync.js"
import AppError from "../utils/AppError.js"
import mongoose from "mongoose"


export const getAllUsers = catchAsync(async (req, res, next) => {

    // pagination >>
    const query = req.query
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
    const limit = Math.max(1, Number.parseInt(query.limit, 10) || 10)

    const skip = (page - 1) * limit

    const users = await User.find()
    .select("name email")
    .skip(skip)
    .limit(limit)
    .lean()
    

    if(!users){
        return next(new AppError("User not found!", 404))
    }

    res.status(200).json({
        success:true,
        message:"All users",
        users
    })

})

// get user by ID >>
export const getUser = catchAsync(async (req, res, next) => {
        const id = req.params.id 
        if(!mongoose.isValidObjectId(id)){
            return next(new AppError("Invalid user!", 401))
        }

        const user = await User.findById(id)
        if(!user)return next(new AppError("User not found!", 404))
        
        res.status(200).json({
            success:true,
            message:"User Details",
            user : {
                name: user.name,
                email: user.email,
                role:user.role
            }
        })

})

// update
export const updateUser = catchAsync( async (req, res, next) => {
            const {name, email, role} = req.body
            const {id} = req.params
            if(!mongoose.isValidObjectId(id))return next(new AppError("Invalid user", 401))
            
            const user = await User.findByIdAndUpdate(
                id, 
                {$set:{
                    name,
                    email,
                    role
                }},
                {returnDocument:"after", runValidators:true} // imp
            ).select("_id name email role")

            if(!user)return next(new AppError("User not found!", 404))
            
            res.status(200).json({
                success:true,
                message:"User updated successfully",
                user
            })

            
})

// delete User >>
export const deleteUser = catchAsync(async (req, res, next) => {
        const id = req.params.id 
        if(!mongoose.isValidObjectId(id)){
            return next(new AppError("Invalid User!", 400))
        }

        const user = await User.findByIdAndDelete(id)
        if(!user){
            return next(new AppError("User not found!", 404))
        }

        res.status(200).json({
            success:true,
            message:"User successfully deleted!",
            user:{
                name:user.name,
                email: user.email,
                role: user.role
            }
        })
        
})


