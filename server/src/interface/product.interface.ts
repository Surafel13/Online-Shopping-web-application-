import mongoose from "mongoose";

export interface IProduct {
    _id: string,
    name: string,
    description: string,
    price: number,
    category: mongoose.Schema.Types.ObjectId,
    stock: number,
    images: string[],
}