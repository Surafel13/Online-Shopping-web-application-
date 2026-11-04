import { getProducts } from "./implementations/getProductsAnalaytics.js";

export class ToolDispatcher {

    async execute(
        toolName: string,
        args: Record<string, unknown>
    ) {
        void args;

        switch (toolName) {
            case "getProducts":
                return await getProducts();
            default:
                return undefined;
        }
    }


}