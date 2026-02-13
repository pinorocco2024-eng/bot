
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { BotConfig, Message } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiClient = () => {
  if (!API_KEY) {
    console.error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const chatWithBot = async (
  bot: BotConfig,
  history: Message[],
  userInput: string
) => {
  const ai = getGeminiClient();
  
  const contents = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.text }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: userInput }]
  });

  // Utilizziamo gemini-3-flash-preview con Google Search per grounding sul dominio
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contents as any,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `
        You are an AI Assistant for the website: ${bot.websiteUrl}.
        Your Name is: ${bot.name}.
        
        CRITICAL: If the user asks about specific pages, prices, or current info on ${bot.websiteUrl}, use the Google Search tool to find the exact details on that domain.

        Context from provided documents:
        ${bot.knowledgeText}

        General Behavior:
        ${bot.systemPrompt}

        Guidelines:
        1. Be helpful, professional, and friendly.
        2. Prioritize info from the Knowledge Base (PDFs), then from live search on ${bot.websiteUrl}.
        3. If you find a relevant link on the site, provide it to the user.
        4. Do not mention you are an AI unless asked.
      `,
      temperature: 0.5,
    },
  });

  return {
    text: response.text || "I'm sorry, I couldn't process that.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateInitialConfig = async (url: string, description: string): Promise<Partial<BotConfig>> => {
  const ai = getGeminiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the URL ${url} and this description: "${description}", generate a JSON configuration for a customer service bot. Include a creative name, a professional system prompt, and a friendly welcome message.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          systemPrompt: { type: Type.STRING },
          welcomeMessage: { type: Type.STRING },
          themeColor: { type: Type.STRING, description: "A hex color code that fits the site brand" },
        },
        required: ["name", "systemPrompt", "welcomeMessage", "themeColor"],
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {};
  }
};

export const summarizePDF = async (base64: string): Promise<string> => {
  const ai = getGeminiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType: 'application/pdf' } },
        { text: "Extract all key information from this PDF that would be useful for a customer support bot to answer questions about products, services, contact info, and policies. Output as a clean text summary." }
      ]
    }
  });

  return response.text || "";
};
