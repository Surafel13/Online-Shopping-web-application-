import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

export const gemini = new GoogleGenAI({
  apiKey: geminiApiKey,
});

export const GEMINI_MODEL = "gemini-2.5-flash";