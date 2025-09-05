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

export const startChat = (): Chat => {
  const aiInstance = getAI();
  chat = aiInstance.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are the Jarvis Onboarding Agent, an expert AI assistant that helps developers create new workflows for the Flower platform. Your primary function is to take a structured set of specifications for a workflow and generate a complete, valid C++ workflow definition in JCL format. The user will provide all necessary details, including selected stages, dependencies, and connections. When asked to generate, your primary output should be the complete C++ code within a single \`\`\`cpp ... \`\`\` block. You can provide a brief confirmation before the code, like "Certainly, here is the generated workflow:". The code should be a plausible example of a JCL workflow definition based on the inputs.`
    }
  });
  return chat;
};

export const sendMessageStream = async (message: string) => {
  if (!chat) {
    chat = startChat();
  }
  return chat.sendMessageStream({ message });
};