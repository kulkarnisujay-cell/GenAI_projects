import { GoogleGenAI, Chat } from "@google/genai";

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const startChat = (systemInstruction: string): Chat => {
  const aiInstance = getAI();
  chat = aiInstance.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    }
  });
  return chat;
};

export const sendMessageStream = async (message: string) => {
  if (!chat) {
    throw new Error("Chat not initialized. Call startChat first.");
  }
  return chat.sendMessageStream({ message });
};