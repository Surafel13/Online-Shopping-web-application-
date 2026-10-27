import mongoose from "mongoose";
import type { IUser } from "../interface/user.interface.js";

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true
    },
    city: { 
         type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        select: false
    },
    role : {
        type : String,
        enum :{
            values : ["customer", "admin"],
            message : "{VALUE} is not supported role." 
        },
        default : "customer",
    },
    isActive : {
        type: Boolean,
        default: true
    },
    addresses: [addressSchema],
    profileImg : {
        type: String
    }
}, {timestamps : true});

const Users = mongoose.model<IUser>("Users", userSchema)
export default Users