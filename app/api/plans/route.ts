import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_PLANS = [
  {
    name: 'Free',
    description: 'Perfect for beginners taking their first steps into data-driven betting.',
    price: 0,
    currency: 'USD',
    interval: 'MONTHLY',
    isActive: true,
    features: [
      'ACCESS TO BASIC AI PREDICTIONS',
      'DAILY MATCH CONFIDENCE SCORES',
      'TOP 2 LEAGUES COVERED',
      '7-DAY FREE TRIAL OF PRO MODEL'
    ]
  },
  {
    name: 'Pro Plan Monthly',
    description: 'For serious bettors who want the ultimate edge over the bookmakers.',
    price: 9.99,
    currency: 'USD',
    interval: 'MONTHLY',
    isActive: true,
    features: [
      'ALL 6 LEAGUES & BASKETBALL',
      'PREMIUM HIGH-CONFIDENCE PICKS',
      'DEEP DATA & MATCH INSIGHTS',
      'PRIORITY ALERTS & LIVE UPDATES',
      'FULL AI EXPLANATIONS'
    ]
  },
  {
    name: 'Pro Plan Yearly',
    description: 'Our most popular annual package with maximum savings and syndicate signals.',
    price: 107.88,
    currency: 'USD',
    interval: 'YEARLY',
    isActive: true,
    features: [
      'ALL 6 LEAGUES & BASKETBALL',
      'PREMIUM HIGH-CONFIDENCE PICKS',
      'DEEP DATA & MATCH INSIGHTS',
      'PRIORITY ALERTS & LIVE UPDATES',
      'FULL AI EXPLANATIONS',
      '10% ANNUAL DISCOUNT & SYNDICATE SIGNALS'
    ]
  }
];

export async function GET() {
  try {
    let plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    // Auto-seed default plans if database is empty or missing Pro plans
    if (!plans || plans.length === 0) {
      const seededPlans = [];
      for (const plan of DEFAULT_PLANS) {
        const created = await prisma.plan.upsert({
          where: { name: plan.name },
          update: plan,
          create: plan,
        });
        seededPlans.push(created);
      }
      plans = seededPlans;
    }

    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    console.error('Error fetching/seeding plans:', error);
    // Return fallback plans gracefully if DB connection fails during static checks or offline dev
    return NextResponse.json({
      success: true,
      data: DEFAULT_PLANS.map((p, idx) => ({ id: `fallback-${idx}`, ...p })),
      fallback: true
    });
  }
}
