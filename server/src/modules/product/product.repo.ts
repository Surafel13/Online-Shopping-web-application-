import Product from "../../database/product.model.js";

export class ProductRepo {
    async createProduct(productData: any){
        return await Product.create(productData)
    }

    async getAllProducts(){
        return await Product.find()
    }

    async getProductById(productId: string){
        return await Product.findById(productId)
    }

    async updateProduct(productId: string, productData: any){
        return await Product.findByIdAndUpdate(productId, productData, {new : true})
    }

    async deleteProduct(productId: string){
        return await Product.findByIdAndDelete(productId)
    }
}

