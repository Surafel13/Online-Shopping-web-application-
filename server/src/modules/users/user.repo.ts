import Users from "../../database/users.model.js";
import type { IAddress } from "../../interface/user.interface.js";

export class UserProfileRepository {
  async getProfile(userId: string) {
    return await Users.findById(userId).select("-password");
  }

  async updateProfile(userId: string, userData: any) {
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
    return await Users.findByIdAndUpdate(
      userId,
      {
        $push: { addresses: address },
      },
      { new: true },
    );
  }

  async updateAddress(userId: string, addressId: string, address: IAddress) {
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
    return await Users.findByIdAndUpdate(
      userId,
      {
        $pull: { addresses: { _id: addressId } },
      },
      { new: true },
    );
  }
}