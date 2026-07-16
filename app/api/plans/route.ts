import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getLocalizedPlanPrice } from '@/lib/pricing/regional';

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
    description: 'Our complete annual package with full AI transparency and syndicate signals.',
    price: 119.88,
    currency: 'USD',
    interval: 'YEARLY',
    isActive: true,
    features: [
      'ALL 6 LEAGUES & BASKETBALL',
      'PREMIUM HIGH-CONFIDENCE PICKS',
      'DEEP DATA & MATCH INSIGHTS',
      'PRIORITY ALERTS & LIVE UPDATES',
      'FULL AI EXPLANATIONS',
      'SYNDICATE SIGNALS & PRIORITY ALERTS'
    ]
  }
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const queryCountry = url.searchParams.get('country');
  let cookieCountry = 'US';
  try {
    const cookieStore = await cookies();
    cookieCountry = cookieStore.get('strikeiq_region')?.value || 'US';
  } catch (_) {}
  const targetCountry = queryCountry || cookieCountry || 'US';

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

    const localizedPlans = plans.map((plan) => {
      const loc = getLocalizedPlanPrice(plan.name, plan.interval || 'MONTHLY', targetCountry);
      return {
        ...plan,
        price: loc.price,
        currency: loc.currency,
        formattedPrice: loc.formattedPrice,
        savingsBadge: loc.savingsBadge
      };
    });

    return NextResponse.json({ success: true, data: localizedPlans, countryCode: targetCountry.toUpperCase() });
  } catch (error: any) {
    console.error('Error fetching/seeding plans:', error);
    // Return localized fallback plans gracefully if DB connection fails during static checks or offline dev
    const localizedFallback = DEFAULT_PLANS.map((p, idx) => {
      const loc = getLocalizedPlanPrice(p.name, p.interval || 'MONTHLY', targetCountry);
      return {
        id: `fallback-${idx}`,
        ...p,
        price: loc.price,
        currency: loc.currency,
        formattedPrice: loc.formattedPrice,
        savingsBadge: loc.savingsBadge
      };
    });
    return NextResponse.json({
      success: true,
      data: localizedFallback,
      countryCode: targetCountry.toUpperCase(),
      fallback: true
    });
  }
}
