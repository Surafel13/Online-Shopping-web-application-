import mongoose from "mongoose"

export const connectDb = async() => {
    await mongoose.connect(process.env.MONGO_URI as string)
    console.log("Connected to database")
}
