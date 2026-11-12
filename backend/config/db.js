import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Mongodb successfully connected")
    }catch(err){
        console.log("Mongodb connection Failed!")
        console.log(err.message)
        process.exit(1)
    }
}

export default connectDB