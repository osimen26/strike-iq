import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/location
 * Automatically detects the user's country code using edge headers, cookies, or IP lookup.
 * Defaults to 'US' (USD) if detection fails or times out.
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`location:${ip}`, RATE_LIMITS.PUBLIC);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    // 1. Check edge proxy geolocation headers (Vercel, Cloudflare, AWS CloudFront)
    const edgeCountry =
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-country-code');

    if (edgeCountry && /^[A-Z]{2}$/i.test(edgeCountry) && edgeCountry.toUpperCase() !== 'XX') {
      return NextResponse.json({
        success: true,
        countryCode: edgeCountry.toUpperCase(),
        source: 'edge_header'
      });
    }

    // 2. Perform server-side IP geolocation lookup with strict 2s timeout (if public IP)
    const ip = getClientIp(req);
    if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.') && ip !== 'unknown') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        const lookupRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'StrikeIQ-LocationService/1.0' }
        });
        clearTimeout(timeoutId);

        if (lookupRes.ok) {
          const data = await lookupRes.json();
          if (data?.country_code && /^[A-Z]{2}$/i.test(data.country_code)) {
            return NextResponse.json({
              success: true,
              countryCode: data.country_code.toUpperCase(),
              source: 'ip_lookup'
            });
          }
        }
      } catch (_) {
        clearTimeout(timeoutId);
      }
    }

    // 3. Check client timezone header (sent by useRegionalPricing for offline/localhost detection)
    const clientTz = req.headers.get('x-timezone') || '';
    if (clientTz) {
      if (clientTz.includes('Lagos') || clientTz.includes('Nigeria')) {
        return NextResponse.json({ success: true, countryCode: 'NG', source: 'timezone_detection' });
      }
      if (clientTz.includes('Accra') || clientTz.includes('Ghana')) {
        return NextResponse.json({ success: true, countryCode: 'GH', source: 'timezone_detection' });
      }
      if (clientTz.includes('Johannesburg') || clientTz.includes('South_Africa')) {
        return NextResponse.json({ success: true, countryCode: 'ZA', source: 'timezone_detection' });
      }
      if (clientTz.includes('Nairobi') || clientTz.includes('Kenya')) {
        return NextResponse.json({ success: true, countryCode: 'KE', source: 'timezone_detection' });
      }
      if (clientTz.includes('Cairo') || clientTz.includes('Egypt')) {
        return NextResponse.json({ success: true, countryCode: 'EG', source: 'timezone_detection' });
      }
    }

    // 4. Fallback to saved cookie preference only if live IP/header/timezone detection failed
    const cookieStore = await cookies();
    const savedRegion = cookieStore.get('strikeiq_region')?.value;
    if (savedRegion && /^[A-Z]{2}$/i.test(savedRegion)) {
      return NextResponse.json({
        success: true,
        countryCode: savedRegion.toUpperCase(),
        source: 'cookie_preference'
      });
    }

    // 5. If all automatic detection fails, default to USD ('US')
    return NextResponse.json({
      success: true,
      countryCode: 'US',
      source: 'default_fallback'
    });
  } catch (error) {
    console.error('[LOCATION] Error detecting location:', error);
    return NextResponse.json({
      success: true,
      countryCode: 'US',
      source: 'error_fallback'
    });
  }
}
