import Users from "../../database/users.model.js";

export class UsersRepo {
    async RegisterUser(userData: any){
        return await Users.create(userData)
    }

    async findByEmail(email: string){
        return await Users.findOne({email : email}).select("+password");
    }

}