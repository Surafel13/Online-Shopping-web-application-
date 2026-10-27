export const buildProductAnalyticsPrompt = (
    products: unknown[]
): string => {
    return `
You are an AI e-commerce business analyst.

Analyze the following product data:

${JSON.stringify(products, null, 2)}

Provide useful insights about:
- Product catalog
- Inventory
- Low-stock and out-of-stock products
- Pricing
- Product information
- Categories
- Business opportunities

Do not invent sales, revenue, customer, or market data.
Use only the provided product data.

Return ONLY valid JSON:

{
  "analytics": {
    "totalProducts": 0,
    "lowStockProducts": 0,
    "outOfStockProducts": 0,
    "categories": [],
    "issues": []
  },
  "productInsights": [],
  "recommendations": [
    {
      "type": "inventory | pricing | catalog | product_information",
      "priority": "high | medium | low",
      "action": "",
      "reason": ""
    }
  ],
  "adminRecommendation": ""
}

The "adminRecommendation" must be a clear, concise, natural-language recommendation based on the analysis.
`;
};