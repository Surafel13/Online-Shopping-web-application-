import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.utils.js";
import { success, ZodError } from "zod";
import { error } from "node:console";

export const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    let statusCode = 500;
    let message = "Internal Server Error";

    if(err instanceof AppError){
        statusCode = err.statusCode,
        message = err.message
    }

    else if(err instanceof ZodError){
        const formatZodError = (err: ZodError) => {
            return err.issues.map((issue) => ({
                field : issue.path.join('.'),
                message : issue.message
            }));
        };

        res.status(400).json({
            success : false,
            error : formatZodError(err)
        })
    }
    
        

    res.status(statusCode).json({
        success : false,
        message : message
    })

}