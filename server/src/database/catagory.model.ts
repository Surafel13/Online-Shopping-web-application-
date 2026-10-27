import mongoose from "mongoose";
import type{ ICatagory } from "../interface/catagory.interface.js";

const catagorySchema = new mongoose.Schema<ICatagory>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
})

const Catagory = mongoose.model<ICatagory>("Catagory", catagorySchema)   
export default Catagory;