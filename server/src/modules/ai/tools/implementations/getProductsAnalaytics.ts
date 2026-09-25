import Product from "../../../../database/product.model.js";

export const getProducts = async () => {
    const products = await Product.find().populate("category", "name");

    return products;
};