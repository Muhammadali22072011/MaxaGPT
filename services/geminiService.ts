import { GoogleGenAI, Content, Part, Role } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize the GoogleGenAI client
// The API key is automatically sourced from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const genAIModel = 'gemini-2.5-flash';

function mapHistoryToGemini(history: ChatMessage[]): Content[] {
    const geminiHistory: Content[] = [];
    for (const message of history) {
        // The sender 'bot' corresponds to the 'model' role in the Gemini API
        const role: Role = message.sender === 'user' ? 'user' : 'model';
        const parts: Part[] = [{ text: message.text }];
        geminiHistory.push({ role, parts });
    }
    // The Gemini API requires an alternating user/model conversation history.
    // We remove the last message if it's from the model, as the next one will be from the user.
    // Or if the last two are from the user.
    if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role !== 'user') {
       geminiHistory.pop();
    }
    return geminiHistory;
}

export async function* getChatResponseStream(history: ChatMessage[], newMessage: string) {
    const model = ai.getGenerativeModel({ model: genAIModel });
    
    const chat = model.startChat({
        history: mapHistoryToGemini(history),
    });

    const result = await chat.sendMessageStream(newMessage);

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
    }
}

export const generateChatTitle = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = `Generate a very short, concise title (3-5 words max) for the following user prompt. Just return the title, nothing else:\n\n"${prompt}"`;
    const response = await ai.models.generateContent({
      model: genAIModel,
      contents: fullPrompt,
    });
    return response.text.replace(/["']/g, "").trim(); // Clean up quotes and whitespace
  } catch (error) {
    console.error("Error generating title:", error);
    return "Chat"; // Fallback title
  }
};


export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image generated.");
        }

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image from Gemini API.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error("No audio data received.");
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to generate speech from Gemini API.");
  }
};