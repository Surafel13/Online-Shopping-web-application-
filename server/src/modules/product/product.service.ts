import {ProductRepo} from "./product.repo.js";
import { AppError } from "../../utils/appError.utils.js";
import { Types } from "mongoose";
import {createProductSchema, updateProductSchema} from "./product.validation.js";
import Catagory from "../../database/catagory.model.js";

export class ProductService {
    private productRepo = new ProductRepo();
    async createProduct(productData: any){

        const validation = createProductSchema.parse(productData)
        const catagory = await Catagory.findById(validation.category)
        if(!catagory){
            throw new AppError("Catagory not found", 404)
        }
        const result = await this.productRepo.createProduct(validation)
        return result
    }

    async getAllProducts(){
        const result = await this.productRepo.getAllProducts()
        return result
    }

    async getProductById(productId: string){
        if(!Types.ObjectId.isValid(productId)){
            throw new AppError("Invalid Object Id", 400)
        }
        const result = await this.productRepo.getProductById(productId)
        if(!result){
            throw new AppError("Product not found", 404)
        }   
        return result
    }

    async updateProduct(productId: string, productData: any){
        if(!Types.ObjectId.isValid(productId)){
            throw new AppError("Invalid Object Id", 400)
        }
        const validation = updateProductSchema.parse(productData)
        const result = await this.productRepo.updateProduct(productId, validation)
        if(!result){
            throw new AppError("Product not found", 404)
        }   
        return result
    }

    async deleteProduct(productId: string){
        if(!Types.ObjectId.isValid(productId)){
            throw new AppError("Invalid Object Id", 400)
        }
        const result = await this.productRepo.deleteProduct(productId)
        if(!result){
            throw new AppError("Product not found", 404)
        }
        return result
    }
}