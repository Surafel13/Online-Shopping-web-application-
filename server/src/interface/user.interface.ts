import { Types } from "mongoose";

export interface IAddress {
    _id?: Types.ObjectId;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}


export interface IUser{
    _id: Types.ObjectId,
    username: string,
    email: string,
    password: string,
    role: "customer" | "admin",
    isActive : boolean,
    addresses: IAddress[],
    profileImg? : string
}