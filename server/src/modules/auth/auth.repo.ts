import Users from "../../database/users.model.js";
import type { z } from "zod";
import { userSignupSchema } from "./auth.validation.js";

export class UsersRepo {
    async RegisterUser(userData: z.infer<typeof userSignupSchema>) {
        return await Users.create({
            ...userData,
            role: "customer",
            isActive: true,
        });
    }

    async findByEmail(email: string){
        return await Users.findOne({email : email}).select("+password");
    }

}