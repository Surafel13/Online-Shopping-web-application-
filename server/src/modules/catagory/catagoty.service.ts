import { CatagoryRepo } from "./catagory.repo.js";

export class CatagoryService {
    private catagoryRepo = new CatagoryRepo();

    async createCatagory(catagoryData: any){
        const result = await this.catagoryRepo.createCatagory(catagoryData)
        return result
    }

    async getAllCatagory(){
        const result = await this.catagoryRepo.getAllCatagory()
        return result
    }

    async getCatagoryById(catagoryId: string){
        const result = await this.catagoryRepo.getCatagoryById(catagoryId)
        return result
    }

    async updateCatagory(catagoryId: string, catagoryData: any){
        const result = await this.catagoryRepo.updateCatagory(catagoryId, catagoryData)
        return result
    }

    async deleteCatagory(catagoryId: string){
        const result = await this.catagoryRepo.deleteCatagory(catagoryId)
        return result
    }

}