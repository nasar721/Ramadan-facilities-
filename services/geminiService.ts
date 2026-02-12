import { GoogleGenAI, Type } from "@google/genai";
import { VerseInspiration, RamadanGreeting, RamadanRecipe } from "../types";

// Always initialize with the direct environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeJsonParse = (text: string | undefined) => {
  if (!text) return null;
  try {
    // Remove potential markdown code block markers
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", text, e);
    return null;
  }
};

export const getDailyInspiration = async (): Promise<VerseInspiration> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Generate a beautiful and uplifting Quranic verse or a reliable Hadith suitable for Ramadan reflection. Include the original Arabic, a clear English translation, its reference, and a short, heart-softening reflection.',
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verse: { type: Type.STRING, description: "The original Arabic text" },
          reference: { type: Type.STRING, description: "The chapter and verse or Hadith source" },
          translation: { type: Type.STRING, description: "English translation" },
          reflection: { type: Type.STRING, description: "A brief spiritual reflection" }
        },
        required: ["verse", "reference", "translation", "reflection"]
      }
    }
  });

  const parsed = safeJsonParse(response.text);
  if (!parsed) {
    throw new Error("Invalid response format from AI");
  }
  return parsed;
};

export const explainAyah = async (ayahText: string, surahName: string, ayahNumber: number, lang: 'en' | 'ar'): Promise<string> => {
  const prompt = `Provide a beautiful, spiritual, and concise explanation (Tafsir) of this Quranic Ayah: "${ayahText}" from Surah ${surahName}, Ayah ${ayahNumber}. The explanation should be heart-softening and relevant to Ramadan. Language: ${lang === 'ar' ? 'Arabic' : 'English'}.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || '';
};

export const generateGreeting = async (name: string, relation: string): Promise<RamadanGreeting> => {
  const prompt = `Create a personalized, warm, and poetic Ramadan greeting for ${name}, who is my ${relation}. The greeting should be sophisticated and deeply meaningful. Output in JSON format. Provide arabicText, englishText, and a poeticNote.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          arabicText: { type: Type.STRING },
          englishText: { type: Type.STRING },
          poeticNote: { type: Type.STRING }
        },
        required: ["arabicText", "englishText", "poeticNote"]
      }
    }
  });

  const parsed = safeJsonParse(response.text);
  if (!parsed) {
    throw new Error("Invalid response format from AI");
  }
  return parsed;
};

export const generateGreetingImage = async (prompt: string, aspectRatio: string = "1:1", style: string = "Ethereal"): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Style: ${style}. A highly detailed, artistic Ramadan themed illustration. ${prompt}. Features crescent moons, elegant Islamic patterns, lanterns (fanous), and a peaceful night sky. No text in the image. Appropriate color palette for ${style} style.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  return '';
};

export const getRecipeSuggestion = async (mealType: 'Iftar' | 'Suhoor', lang: 'en' | 'ar' = 'en'): Promise<RamadanRecipe> => {
  const prompt = `Suggest a healthy, nutritious, and culturally authentic ${mealType} recipe for Ramadan. Focus on sustained energy for fasting. The output language must be ${lang === 'ar' ? 'Arabic' : 'English'}. Output in JSON.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          nutritionTips: { type: Type.STRING }
        },
        required: ["name", "description", "ingredients", "instructions", "nutritionTips"]
      }
    }
  });

  const parsed = safeJsonParse(response.text);
  if (!parsed) {
    throw new Error("Invalid response format from AI");
  }
  return parsed;
};