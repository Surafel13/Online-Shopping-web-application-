import Catagory from "../../database/catagory.model.js";
import type { ICatagory } from "../../interface/catagory.interface.js";

export class CatagoryRepo {
    async createCatagory(catagoryData: ICatagory){
        return await Catagory.create(catagoryData)
    }

    async getAllCatagory(){
        return await Catagory.find()
    }

    async getCatagoryById(catagoryId: string){
        return await Catagory.findById(catagoryId)
    }

    async updateCatagory(catagoryId: string, catagoryData: Partial<ICatagory>){
        return await Catagory.findByIdAndUpdate(catagoryId, catagoryData, {new: true})
    }

    async deleteCatagory(catagoryId: string){
        return await Catagory.findByIdAndDelete(catagoryId)
    }

}
