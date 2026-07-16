import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getClientIp } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/location
 * Automatically detects the user's country code using edge headers, cookies, or IP lookup.
 * Defaults to 'US' (USD) if detection fails or times out.
 */
export async function GET(req: Request) {
  try {
    // 1. Check if user already has a saved preference cookie
    const cookieStore = await cookies();
    const savedRegion = cookieStore.get('strikeiq_region')?.value;
    if (savedRegion && /^[A-Z]{2}$/i.test(savedRegion)) {
      return NextResponse.json({
        success: true,
        countryCode: savedRegion.toUpperCase(),
        source: 'cookie_preference'
      });
    }

    // 2. Check edge proxy geolocation headers (Vercel, Cloudflare, AWS CloudFront)
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

    // 3. Fallback: Perform server-side IP geolocation lookup with strict 2s timeout
    const ip = getClientIp(req);
    if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
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
      } catch (lookupErr) {
        clearTimeout(timeoutId);
        // Fall through to default if external API times out or fails
      }
    }

    // 4. If all automatic detection fails (or running locally offline), default to USD ('US')
    return NextResponse.json({
      success: true,
      countryCode: 'US',
      source: 'default_fallback'
    });
  } catch (error: any) {
    console.error('Error detecting location:', error);
    return NextResponse.json({
      success: true,
      countryCode: 'US',
      source: 'error_fallback'
    });
  }
}
