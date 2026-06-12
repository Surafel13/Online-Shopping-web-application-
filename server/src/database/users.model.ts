import mongoose from "mongoose";
import type { IUser } from "../interface/user.interface.js";

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
        required: true
    },
    role : {
        type : String,
        enum :{
            values : ["customer", "admin"],
            message : "Out of decleard user role" 
        },
        default : "customer",
    },
    isActive : {
        type: Boolean,
        default: true
    }},
    {timestamps : true},
)

const Users = mongoose.model<IUser>("Users", userSchema)
export default Users