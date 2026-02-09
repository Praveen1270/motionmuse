
import { GoogleGenAI, Type } from "@google/genai";
import { PerformanceType, SkillLevel, PerformanceAnalysis } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzePerformanceFrame = async (
  base64Image: string,
  performanceType: PerformanceType,
  skillLevel: SkillLevel
): Promise<PerformanceAnalysis | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const prompt = `
      Act as an expert performance technique analyst. Analyze this frame from a ${performanceType} performance.
      Skill level of performer: ${skillLevel}.
      
      Focus on:
      1. Body alignment and posture.
      2. Movement quality or instrument technique.
      3. Timing and rhythmic precision (if applicable to the frame).
      4. Emotional expression.
      
      Provide actionable feedback and specific coordinate-based markers (normalized 0-100) for issues.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timestamp: { type: Type.STRING },
            overall_score: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            technique_issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  visual_marker: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      color: { type: Type.STRING },
                      label: { type: Type.STRING }
                    },
                    required: ["x", "y", "color", "label"]
                  }
                },
                required: ["category", "severity", "description", "correction"]
              }
            }
          },
          required: ["overall_score", "strengths", "technique_issues"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as PerformanceAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

export const generateCoachReport = async (history: any[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = `
      As a world-class performance coach, analyze this user's history of practice sessions:
      ${JSON.stringify(history)}
      
      Identify:
      1. Long-term progress trends.
      2. Priority areas for improvement.
      3. A specific 30-minute practice plan for the next session.
      
      Provide the response in Markdown format with encouraging but professional tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt
    });

    return response.text || "Unable to generate coach report at this time.";
  } catch (error) {
    console.error("Coach Report Error:", error);
    return "Error generating report.";
  }
};
