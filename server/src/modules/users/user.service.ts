import { AppError } from "../../utils/appError.utils.js";
import { UserProfileRepo } from "./user.repo.js";
import { Types } from "mongoose";

export class UserProfileService {
  private userProfileRepo = new UserProfileRepo();

  async getUserProfile(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid Object Id", 400);
    }
    const user = await this.userProfileRepo.getProfile(userId);
    if (!user) {
      throw new AppError("Account not found", 404);
    }
    return user;
  }

  async updateProfile(userId: string, userData: any) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid Object Id", 400);
    }
    const result = await this.userProfileRepo.updateProfile(userId, userData);
    if (!result) {
      throw new AppError("Account not found", 404);
    }
    return result;
  }

  async deleteProfile(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid Object Id", 400);
    }
    const result = await this.userProfileRepo.deleteProfile(userId);
    if (!result) {
      throw new AppError("Account not found", 404);
    }
    return result;
  }
}
