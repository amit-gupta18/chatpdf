// lib/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", // Gemini OpenAI-compatible endpoint
});
