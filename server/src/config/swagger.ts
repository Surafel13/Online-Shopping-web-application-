import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "E-Commerce Backend API Documentation",
    },
    servers: [
      {
        url: "http://localhost:7000",
      },
    ],
  },
  apis: ["src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);