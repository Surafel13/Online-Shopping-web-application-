import { CatagoryRepo } from "./catagory.repo.js";
import { Types } from "mongoose";
import { z } from "zod";
import { AppError } from "../../utils/appError.utils.js";
import type { ICatagory } from "../../interface/catagory.interface.js";

const createCategorySchema = z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().min(1).max(500),
});

const updateCategorySchema = createCategorySchema.partial();

export class CatagoryService {
    private catagoryRepo = new CatagoryRepo();

    async createCatagory(catagoryData: unknown){
        const validatedCategory = createCategorySchema.parse(catagoryData);
        const result = await this.catagoryRepo.createCatagory(validatedCategory)
        return result
    }

    async getAllCatagory(){
        const result = await this.catagoryRepo.getAllCatagory()
        return result
    }

    async getCatagoryById(catagoryId: string){
        if (!Types.ObjectId.isValid(catagoryId)) {
            throw new AppError("Invalid Category Id", 400);
        }
        const result = await this.catagoryRepo.getCatagoryById(catagoryId)
        if (!result) throw new AppError("Category not found", 404);
        return result
    }

    async updateCatagory(catagoryId: string, catagoryData: unknown){
        if (!Types.ObjectId.isValid(catagoryId)) {
            throw new AppError("Invalid Category Id", 400);
        }
        const validatedCategory = updateCategorySchema.parse(catagoryData);
        const update: Partial<ICatagory> = {};
        if (validatedCategory.name !== undefined) update.name = validatedCategory.name;
        if (validatedCategory.description !== undefined) {
            update.description = validatedCategory.description;
        }
        const result = await this.catagoryRepo.updateCatagory(catagoryId, update)
        if (!result) throw new AppError("Category not found", 404);
        return result
    }

    async deleteCatagory(catagoryId: string){
        if (!Types.ObjectId.isValid(catagoryId)) {
            throw new AppError("Invalid Category Id", 400);
        }
        const result = await this.catagoryRepo.deleteCatagory(catagoryId)
        if (!result) throw new AppError("Category not found", 404);
        return result
    }

}