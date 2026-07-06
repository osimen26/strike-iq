import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePrediction } from "@/lib/ai-engine";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/update-odds
 * Automated Vercel Cron Job scheduled every 4 hours.
 * Scans upcoming fixtures, sends data to Strike-IQ Quant V4 AI, and generates/updates pro predictions & confidence scores.
 */
export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Secret (if configured in production environment)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (process.env.NODE_ENV === "production" && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      console.warn("[CRON_SECURITY] Unauthorized cron execution attempt blocked.");
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[CRON_SECURITY] Unauthorized cron execution attempt blocked.");
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    console.log("[CRON_UPDATE_ODDS] Starting automated Strike-IQ Quant V4 odds refresh job...");

    // 2. Fetch up to 8 active matches that need prediction updates or generation
    const upcomingMatches = await prisma.match.findMany({
      where: {
        isDeleted: false,
        status: { in: ["SCHEDULED", "IN_PROGRESS", "PENDING"] }
      },
      orderBy: {
        matchDate: "asc",
      },
      take: 8,
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        sport: true,
        predictions: {
          include: {
            explanation: true
          }
        }
      }
    });

    if (!upcomingMatches || upcomingMatches.length === 0) {
      console.log("[CRON_UPDATE_ODDS] No upcoming fixtures found needing odds refresh.");
      return NextResponse.json({
        success: true,
        message: "No scheduled fixtures found to process.",
        processedCount: 0,
        timestamp: new Date().toISOString()
      });
    }

    const processedResults = [];
    let updatedCount = 0;
    let createdCount = 0;

    // 3. Process fixtures sequentially through Strike-IQ Quant V4 engine
    for (const match of upcomingMatches) {
      try {
        console.log(`[CRON_UPDATE_ODDS] Processing fixture: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.league.name})`);

        // Build rich contextual prompt data for Strike-IQ AI
        const contextData = {
          fixture: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          league: match.league.name,
          sport: match.sport.name,
          matchDate: match.matchDate,
          status: match.status,
          historicalForm: `Recent form momentum favors ${match.homeTeam.name} at home; ${match.awayTeam.name} testing defensive discipline.`,
          keyVariables: ["Player availability", "Tactical matchup", "Home pitch advantage", "League standings pressure"]
        };

        // Call Strike-IQ Quant V4 Engine
        const aiResult = await generatePrediction(match.id, contextData);

        if (!aiResult) {
          console.warn(`[CRON_UPDATE_ODDS] AI engine returned null for match ${match.id}`);
          continue;
        }

        // Calculate realistic implied odds from AI confidence score (e.g. 80% conf -> ~1.20 - 1.50 odds)
        const rawOdds = Math.max(1.15, Number((1 / (aiResult.confidence / 100) * 0.94).toFixed(2)));
        const isHighConfidence = aiResult.confidence >= 78; // VIP Pro picks

        const existingPrediction = match.predictions[0];

        if (existingPrediction) {
          // Update existing prediction with fresh AI calculation
          await prisma.prediction.update({
            where: { id: existingPrediction.id },
            data: {
              selection: aiResult.selection,
              confidence: aiResult.confidence,
              odds: rawOdds,
              status: "PUBLISHED",
              isPremium: isHighConfidence,
              explanation: {
                upsert: {
                  create: {
                    content: aiResult.explanation,
                    keyFactors: aiResult.keyFactors,
                    aiModelUsed: "STRIKE-IQ QUANT V4"
                  },
                  update: {
                    content: aiResult.explanation,
                    keyFactors: aiResult.keyFactors,
                    aiModelUsed: "STRIKE-IQ QUANT V4"
                  }
                }
              }
            }
          });
          updatedCount++;
          processedResults.push({
            match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
            action: "UPDATED",
            selection: aiResult.selection,
            confidence: `${aiResult.confidence}%`,
            odds: rawOdds,
            tier: isHighConfidence ? "VIP PRO" : "FREE"
          });
        } else {
          // Create brand new prediction
          await prisma.prediction.create({
            data: {
              matchId: match.id,
              sportId: match.sportId,
              leagueId: match.leagueId,
              predictionType: "MATCH_WINNER",
              selection: aiResult.selection,
              confidence: aiResult.confidence,
              odds: rawOdds,
              status: "PUBLISHED",
              isPremium: isHighConfidence,
              explanation: {
                create: {
                  content: aiResult.explanation,
                  keyFactors: aiResult.keyFactors,
                  aiModelUsed: "STRIKE-IQ QUANT V4"
                }
              }
            }
          });
          createdCount++;
          processedResults.push({
            match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
            action: "CREATED",
            selection: aiResult.selection,
            confidence: `${aiResult.confidence}%`,
            odds: rawOdds,
            tier: isHighConfidence ? "VIP PRO" : "FREE"
          });
        }
      } catch (matchError: any) {
        console.error(`[CRON_UPDATE_ODDS] Error processing match ${match.id}:`, matchError.message);
      }
    }

    // 4. Log Audit summary
    console.log(`[CRON_UPDATE_ODDS] Job complete. Created: ${createdCount}, Updated: ${updatedCount}`);

    return NextResponse.json({
      success: true,
      job: "Strike-IQ Quant V4 Odds Refresh",
      processedTotal: processedResults.length,
      created: createdCount,
      updated: updatedCount,
      results: processedResults,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("[CRON_UPDATE_ODDS] Fatal cron failure:", error);
    return NextResponse.json({
      success: false,
      error: "Automated cron job failed during execution.",
      details: error.message
    }, { status: 500 });
  }
}
