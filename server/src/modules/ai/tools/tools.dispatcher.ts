import { getProducts } from "./implementations/getProductsAnalaytics.js";

class ToolDispatcher {

    async excute(
        toolName: string,
        args: Record<string, any>
    ) {

        switch (toolName) {
            case "getProducts":
                return await getProducts();

        }
    }


}