import jwt, { type SignOptions } from "jsonwebtoken";
import { Types } from "mongoose"

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || "90d"


if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
  process.exit(1);
}


export const generateToken = (userId: Types.ObjectId, userRole: string) => {
  return jwt.sign({
    id: userId.toString(),
    role : userRole
  }, 
  JWT_SECRET as string, 
  { expiresIn: JWT_EXPIRE } as SignOptions)
};