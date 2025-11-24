import { GoogleGenAI, Type } from "@google/genai";
import { AiAnalysisResult } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
你是一位乐于助人、善于鼓励的初中教师助手。
你的工作是查看学生作业或项目封面的图片，识别学科，提供非常简短的一句话摘要，并写一句简短的鼓励性评语。
请务必使用简体中文回答。
`;

export const analyzeHomeworkImage = async (base64Data: string, mimeType: string): Promise<AiAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "分析这份作业提交。识别可能的学科（例如：数学、历史、美术、语文等），用一句话概括可见内容，并写一句3-5个字的简短鼓励语（例如：“字迹工整！”或“非常有创意！”）。",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            summary: { type: Type.STRING },
            comment: { type: Type.STRING, description: "简短的鼓励性评语，如'字迹工整！'或'非常有创意！'" },
          },
          required: ["subject", "summary", "comment"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI 没有返回响应");
    
    return JSON.parse(text) as AiAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      subject: "通用",
      summary: "上传的作业文件。",
      comment: "已提交",
    };
  }
};