import { GoogleGenAI, Modality, Part } from "@google/genai";
import { Character } from "../types";

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
        console.error("Error calling Gemini API for Image:", error);

        let detailedMessage = "An unexpected error occurred. Please try again.";

        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            
            if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                detailedMessage = "API limit reached. You may have exceeded your request quota. Please check your API usage and billing, or try again later.";
            } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                detailedMessage = "Generation failed due to safety filters. The prompt or reference images may contain sensitive content. Please adjust and try again.";
            } else if (errorMessage.includes('invalid argument') || errorMessage.includes('bad request')) {
                detailedMessage = "Invalid request. This might be due to an unsupported image format (use JPEG, PNG) or an issue with the prompt's structure. Please review your inputs.";
            } else if (errorMessage.includes('api key not valid')) {
                detailedMessage = "Invalid API key. Please ensure your API key is configured correctly.";
            } else if (errorMessage.includes('500') || errorMessage.includes('internal error')) {
                 detailedMessage = "The AI service encountered a temporary internal error. Please wait a few moments and try again.";
            } else if (error.message.startsWith("No image data found")) {
                 detailedMessage = error.message;
            } else if (error.message) {
                detailedMessage = error.message.replace(/\[\d{3}\].*?(\s-\s)?/, '').trim();
            }
        }
        
        throw new Error(detailedMessage);
    }
}

export async function generateStoryVideo(prompt: string, character: Character, aspectRatio: '16:9' | '9:16'): Promise<string> {
    try {
        const aiWithNewKey = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let operation = await aiWithNewKey.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `${prompt}, featuring a character named ${character.name} who looks like the character in the provided image. Maintain a consistent style.`,
            image: {
                imageBytes: character.base64!.split(',')[1],
                mimeType: character.file?.type || 'image/png',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await aiWithNewKey.operations.getVideosOperation({ operation: operation });
        }

        if (operation.error) {
            throw new Error(`Video generation failed: ${operation.error.message}`);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded but no download link was provided.");
        }
        
        // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Failed to download video file:", errorBody);
            throw new Error(`Failed to download video file. Status: ${response.status}`);
        }
        
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error calling Gemini API for Video:", error);
         if (error instanceof Error) {
            throw new Error(error.message.replace(/\[\d{3}\].*?(\s-\s)?/, '').trim());
        }
        throw new Error("An unexpected error occurred during video generation.");
    }
}
