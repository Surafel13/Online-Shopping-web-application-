import { AppError } from "../../utils/appError.utils.js";
import { UserProfileRepository } from "./user.repo.js";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import type { IAddress } from "../../interface/user.interface.js";
import {
  addressSchema,
  adminUpdateUserSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "./user.validation.js";

export class UserProfileService {
  private userProfileRepo = new UserProfileRepository();

  async getAllUsers() {
    return await this.userProfileRepo.getAllUsers();
  }

  async updateUserByAdmin(userId: string, userData: unknown) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid Object Id", 400);
    }

    const parsedData = adminUpdateUserSchema.parse(userData);
    const result = await this.userProfileRepo.updateProfile(userId, parsedData);

    if (!result) {
      throw new AppError("Account not found", 404);
    }

    return result;
  }

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
  async updateProfile(userId: string, userData: unknown) {
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

  async changePassword(userId: string, passwordData: unknown) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid Object Id", 400);
    }

    const { currentPassword, newPassword } =
      changePasswordSchema.parse(passwordData);
    const user = await this.userProfileRepo.getProfileWithPassword(userId);
    if (!user?.password) {
      throw new AppError("Account not found", 404);
    }

    const currentMatches = await bcrypt.compare(currentPassword, user.password);
    if (!currentMatches) {
      throw new AppError("Current password is incorrect.", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userProfileRepo.updatePassword(userId, hashedPassword);
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

    const validatedAddress = addressSchema.parse(address);
    const normalizedAddress: IAddress = {
      ...validatedAddress,
      fullName: validatedAddress.fullName ?? "",
      phone: validatedAddress.phone ?? "",
    };

    const updatedUser = await this.userProfileRepo.addAddress(userId, normalizedAddress);
    if (!updatedUser) {
      throw new AppError("Account not found", 404);
    }
    return updatedUser;
  }

  async updateAddress(userId: string, addressId: string, address: IAddress) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid User Id", 400);
    }

    if (!Types.ObjectId.isValid(addressId)) {
      throw new AppError("Invalid Address Id", 400);
    }

    const validatedAddress = addressSchema.parse(address);
    const normalizedAddress: IAddress = {
      ...validatedAddress,
      fullName: validatedAddress.fullName ?? "",
      phone: validatedAddress.phone ?? "",
    };
    const updatedUser = await this.userProfileRepo.updateAddress(
      userId,
      addressId,
      normalizedAddress,
    );
    if (!updatedUser) {
      throw new AppError("Address not found", 404);
    }
    return updatedUser;
  }

  async deleteAddress(userId: string, addressId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid User Id", 400);
    }

    if (!Types.ObjectId.isValid(addressId)) {
      throw new AppError("Invalid Address Id", 400);
    }

    const updatedUser = await this.userProfileRepo.deleteAddress(
      userId,
      addressId,
    );
    if (!updatedUser) {
      throw new AppError("Account not found", 404);
    }
    return updatedUser;
  }
}