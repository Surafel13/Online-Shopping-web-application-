import Users from "../../database/users.model.js";

export class UserProfileRepo{
    async getProfile(userId: string){
        return await Users.findById(userId).select("-password");
    }

    async updateProfile(userId: string ,userData: any){
        return await Users.findByIdAndUpdate(userId, userData).select("-password");
    }

    async deleteProfile(userId: string){
        return await Users.findByIdAndDelete(userId).select("-password");
    }
}