import { AppError } from "../../utils/appError.utils.js";
import { UserProfileRepository } from "./user.repo.js";
import { Types } from "mongoose";
import type { IAddress } from "../../interface/user.interface.js";
import { updateProfileSchema } from "./user.validation.js";

export class UserProfileService {
  private userProfileRepo = new UserProfileRepository();

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

  // ✅ SINGLE UPDATE (WITH ZOD VALIDATION)
  async updateProfile(userId: string, userData: any) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid Object Id", 400);
    }

    // ZOD VALIDATION
    const parsedData = updateProfileSchema.parse(userData);

    const result = await this.userProfileRepo.updateProfile(
      userId,
      parsedData,
    );

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

  // ADDRESS (UNCHANGED)
  async addAddress(userId: string, address: IAddress) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid User Id", 400);
    }

    return await this.userProfileRepo.addAddress(userId, address);
  }

  async updateAddress(userId: string, addressId: string, address: IAddress) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid User Id", 400);
    }

    if (!Types.ObjectId.isValid(addressId)) {
      throw new AppError("Invalid Address Id", 400);
    }

    return await this.userProfileRepo.updateAddress(
      userId,
      addressId,
      address,
    );
  }

  async deleteAddress(userId: string, addressId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid User Id", 400);
    }

    if (!Types.ObjectId.isValid(addressId)) {
      throw new AppError("Invalid Address Id", 400);
    }

    return await this.userProfileRepo.deleteAddress(
      userId,
      addressId,
    );
  }
}