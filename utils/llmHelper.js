import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateSummary(content) {
   const prompt= `Summarize this content: ${content}`
  
   const response = await model2.generateContent(prompt);
   return response.response.text();
}

async function generateTags(content) {
    const prompt= `Generate 20 tags for this content as a string separated by ,: ${content}`
   
    const response = await model2.generateContent(prompt);
    return response.response.text().trim().split(',').map(tag => tag.trim());;
}

export  { generateSummary, generateTags };
