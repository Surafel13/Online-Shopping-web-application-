import mongoose from "mongoose";
import type{ IProduct } from "../interface/product.interface.js";

const productSchema = new mongoose.Schema<IProduct>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true, 
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Catagory",
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    images: {
        type: [String],
        
    },
});

const Product = mongoose.model<IProduct>("Product", productSchema)
export default Product