import Users from "../../database/users.model.js";
import type { IAddress } from "../../interface/user.interface.js";

export class UserProfileRepository {
  async getAllUsers() {
    return await Users.find().select("-password").sort({ createdAt: -1 });
  }

  async getProfile(userId: string) {
    return await Users.findById(userId).select("-password");
  }

  async getProfileWithPassword(userId: string) {
    return await Users.findById(userId).select("+password");
  }

  async updatePassword(userId: string, password: string) {
    return await Users.findByIdAndUpdate(
      userId,
      { $set: { password } },
      { new: true },
    );
  }

  async updateProfile(userId: string, userData: Record<string, unknown>) {
    return await Users.findByIdAndUpdate(
      userId,
      {
        $set: userData,
      },
      {
        new: true,
      },
    ).select("-password");
  }

  async deleteProfile(userId: string) {
    return await Users.findByIdAndDelete(userId);
  }

  async addAddress(userId: string, address: IAddress) {
    const userExists = await Users.exists({ _id: userId });
    if (!userExists) return null;

    if (address.isDefault) {
      await Users.updateOne(
        { _id: userId },
        { $set: { "addresses.$[].isDefault": false } },
      );
    }
    return await Users.findByIdAndUpdate(
      userId,
      {
        $push: { addresses: address },
      },
      { new: true },
    );
  }

  async updateAddress(userId: string, addressId: string, address: IAddress) {
    const addressExists = await Users.exists({
      _id: userId,
      "addresses._id": addressId,
    });
    if (!addressExists) return null;

    if (address.isDefault) {
      await Users.updateOne(
        { _id: userId },
        { $set: { "addresses.$[].isDefault": false } },
      );
    }
    return await Users.findOneAndUpdate(
      {
        _id: userId,
        "addresses._id": addressId,
      },
      {
        $set: {
          "addresses.$": {
            _id: addressId,
            ...address,
          },
        },
      },
      { new: true },
    );
  }

  async deleteAddress(userId: string, addressId: string) {
    return await Users.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      {
        $pull: { addresses: { _id: addressId } },
      },
      { new: true },
    );
  }
}