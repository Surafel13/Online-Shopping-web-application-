import { gemini, GEMINI_MODEL } from "../../config/gemini.js";
import { buildProductAnalyticsPrompt } from "./prompt/generateAnalaytics.prompt.js";
import { getProducts } from "./tools/implementations/getProductsAnalaytics.js";

export class AIService {
    async getProductsAnalytics(): Promise<unknown> {
        const products = await getProducts();

        const prompt = buildProductAnalyticsPrompt(products);

        const response = await gemini.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const text = response.text;

        if (!text) {
            throw new Error("Gemini returned an empty response");
        }

        try {
            return JSON.parse(text);
        } catch {
            throw new Error("Gemini returned an invalid JSON response");
        }
    }
}

export const aiService = new AIService();