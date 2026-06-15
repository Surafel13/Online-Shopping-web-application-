import mongoose, { Types } from "mongoose";

export interface IProduct {
    _id: Types.ObjectId,
    name: string,
    description: string,
    price: number,
    category: mongoose.Schema.Types.ObjectId,
    stock: number,
    images: string[],
}