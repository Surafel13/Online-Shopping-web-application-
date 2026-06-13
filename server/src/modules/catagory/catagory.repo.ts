import Catagory from "../../database/catagory.model.js";

export class CatagoryRepo {
    async createCatagory(catagoryData: any){
        return await Catagory.create(catagoryData)
    }

    async getAllCatagory(){
        return await Catagory.find()
    }

    async getCatagoryById(catagoryId: string){
        return await Catagory.findById(catagoryId)
    }

    async updateCatagory(catagoryId: string, catagoryData: any){
        return await Catagory.findByIdAndUpdate(catagoryId, catagoryData, {new: true})
    }

    async deleteCatagory(catagoryId: string){
        return await Catagory.findByIdAndDelete(catagoryId)
    }

}

