import { prisma } from "@/lib/prisma";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
export interface AiPredictionResult {
  selection: string;
  confidence: number;
  explanation: string;
  keyFactors: string[];
  homeWinProb: number;
  awayWinProb: number;
  drawProb: number;
}

export async function generatePrediction(matchId: string, contextData: Record<string, unknown>): Promise<AiPredictionResult | null> {
  if (!DEEPSEEK_API_KEY) {
    console.error("Missing DEEPSEEK_API_KEY environment variable");
    return null;
  }

  // SECURITY: Sanitize contextData values against prompt injection keywords/tags
  const safeContext: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(contextData || {})) {
    if (typeof val === 'string') {
      safeContext[key] = val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/ignore previous instructions/gi, '[filtered]')
        .replace(/system prompt/gi, '[filtered]')
        .slice(0, 500);
    } else if (Array.isArray(val)) {
      safeContext[key] = val.map(item => typeof item === 'string' ? item.slice(0, 200) : item);
    } else {
      safeContext[key] = val;
    }
  }

  const prompt = `
    You are an expert sports analyst AI. Analyze the following match data and provide a quantitative prediction.
    Match Data: ${JSON.stringify(safeContext)}
    
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a specialized sports betting AI. Return only JSON data." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    clearTimeout(timeoutId);

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

  } catch (error: unknown) {
    console.error("AI Generation Failed:", error);
    
    // Log the failed AI Job
    await prisma.aiJob.create({
      data: {
        matchId,
        promptUsed: prompt,
        model: "deepseek-chat",
        response: "",
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });

    return null;
  }
}
