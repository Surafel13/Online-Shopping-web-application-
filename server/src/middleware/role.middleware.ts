import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError.utils.js"

export const restrictTo = (...allowedRoles : string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user){
            throw new AppError("Authentication Required. Please sign in or login ggg", 401)
        }
        else{
            if(allowedRoles.includes(req.user.role)){
                return next()
            }
            else{
                throw new AppError("You are not allowed for this", 403)
            }
        }
    }
}