import { GoogleGenAI, Modality, Part } from "@google/genai";

// Fix: Per coding guidelines, initialize GoogleGenAI with process.env.API_KEY, which is assumed to be available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateStoryImage(parts: Part[]): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("No image data found in the response.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate image from Gemini API.");
    }
}
