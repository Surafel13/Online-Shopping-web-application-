import type { Types } from "mongoose";
import type { ICartItem } from "./cartItem.interface.js";

export interface ICart {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  totalItems: number;
}