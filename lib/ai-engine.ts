import { prisma } from "@/lib/prisma";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = "REDACTED_KEY"
export interface AiPredictionResult {
  selection: string;
  confidence: number;
  explanation: string;
  keyFactors: string[];
  homeWinProb: number;
  awayWinProb: number;
  drawProb: number;
}

export async function generatePrediction(matchId: string, contextData: any): Promise<AiPredictionResult | null> {
  if (!DEEPSEEK_API_KEY) {
    console.error("Missing DEEPSEEK_API_KEY environment variable");
    return null;
  }

  const prompt = `
    You are an expert sports analyst AI. Analyze the following match data and provide a prediction.
    Match Data: ${JSON.stringify(contextData)}
    
    Output format MUST be strictly JSON with these exact keys:
    {
      "selection": "HOME_WIN" | "AWAY_WIN" | "DRAW",
      "confidence": number (0-100),
      "explanation": "Detailed analysis text...",
      "keyFactors": ["factor 1", "factor 2"],
      "homeWinProb": number (0-100),
      "awayWinProb": number (0-100),
      "drawProb": number (0-100)
    }
  `;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a specialized sports betting AI." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsedResult = JSON.parse(resultText) as AiPredictionResult;

    // Log the AI Job
    await prisma.aiJob.create({
      data: {
        matchId,
        promptUsed: prompt,
        model: "deepseek-chat",
        response: resultText,
        tokensUsed: data.usage?.total_tokens || 0,
        status: "SUCCESS"
      }
    });

    return parsedResult;

  } catch (error: any) {
    console.error("AI Generation Failed:", error);
    
    // Log the failed AI Job
    await prisma.aiJob.create({
      data: {
        matchId,
        promptUsed: prompt,
        model: "deepseek-chat",
        response: "",
        status: "FAILED",
        errorMessage: error.message
      }
    });

    return null;
  }
}
