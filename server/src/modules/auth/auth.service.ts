import { AppError } from "../../utils/appError.utils.js";
import { UsersRepo } from "./auth.repo.js";
import { userSignupSchema, userLoginSchema } from "./auth.validation.js";
import { generateToken } from "../../utils/jwt.utils.js";
import bcrypt from "bcrypt";


export class UserService{
    private userRepo = new UsersRepo();

    async Signup(userData: any){

        const validatedata = userSignupSchema.parse(userData)
        const existedUser = await this.userRepo.findByEmail(validatedata.email)

        if(existedUser){
            throw new AppError("User already exist", 400);
        }

        const hashedPassword = await bcrypt.hash(validatedata.password, 10);
        const storeData = {
            ...validatedata,
            password : hashedPassword
        }

        const user = await this.userRepo.RegisterUser(storeData)
        const token = generateToken(user._id)

        return {
            user : user,
            token : token
        }

    }


    async login(userData: any){
        const validatedata = userLoginSchema.parse(userData)

        const result = await this.userRepo.findByEmail(validatedata.email);
        if(!result){
            throw new AppError("User not found", 401)
        }

        const isMatch = await bcrypt.compare(result.password, validatedata.password)
        if(isMatch){
            throw new AppError("Invalid credentials", 401)
        }

        const token = generateToken(result._id)

        return {
            user : result,
            token : token
        }
    }

}