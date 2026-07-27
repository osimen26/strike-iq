import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { requireMasterAdmin, logAdminAudit, MASTER_ADMIN_EMAIL, MASTER_ADMIN_EMAILS } from '@/lib/security/adminGuard';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Rate limit: 60 admin reads per minute per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`admin-users-read:${ip}`, RATE_LIMITS.ADMIN_READ);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const { user, errorResponse } = await requireMasterAdmin();
    if (errorResponse) return errorResponse;

    const supabase = await createClient();

    // Create Supabase admin client — ONLY use server-side env vars for the service role key.
    // NEVER reference NEXT_PUBLIC_ prefixed vars for secrets — they are embedded in the client bundle.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const supabaseAdmin = serviceRoleKey
      ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
      : null;

    const supabasePublic = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // 1. Fetch real users from Supabase Auth engine (auth.users)
    interface AuthSummaryUser {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
      email_confirmed_at?: string | null;
      created_at?: string;
    }
    let authEngineUsers: AuthSummaryUser[] = [];
    if (supabaseAdmin) {
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
        if (authData?.users && authData.users.length > 0) {
          authEngineUsers = authData.users as unknown as AuthSummaryUser[];
        }
      } catch (authErr) {
        console.warn('Supabase Auth admin listUsers fetch warning:', authErr);
      }
    }

    // Direct SQL fallback: query auth.users directly via Prisma if listUsers did not return results
    if (authEngineUsers.length === 0) {
      try {
        const rawUsers = (await prisma.$queryRawUnsafe(`
          SELECT id, email, raw_user_meta_data as meta, created_at, email_confirmed_at 
          FROM auth.users 
          ORDER BY created_at DESC
        `)) as Array<Record<string, unknown>>;
        if (rawUsers && rawUsers.length > 0) {
          authEngineUsers = rawUsers.map(ru => ({
            id: String(ru.id || ''),
            email: String(ru.email || ''),
            user_metadata: ((typeof ru.meta === 'string' ? JSON.parse(ru.meta) : ru.meta) || {}) as Record<string, unknown>,
            email_confirmed_at: ru.email_confirmed_at ? String(ru.email_confirmed_at) : null,
            created_at: String(ru.created_at || new Date().toISOString())
          }));
        }
      } catch (sqlErr) {
        console.warn('Direct SQL auth.users fetch warning:', sqlErr);
      }
    }

    // 2. Fetch real users and subscriptions from Prisma PostgreSQL
    interface UserRecord {
      id: string;
      email?: string;
      name?: string | null;
      role?: string;
      emailVerified?: boolean | Date | null;
      createdAt?: string | Date;
      referralCode?: string | null;
    }
    interface SubRecord {
      userId?: string;
      status?: string;
    }
    interface PayRecord {
      userId?: string;
      status?: string;
    }
    let prismaUsers: UserRecord[] = [];
    let prismaSubs: SubRecord[] = [];
    let prismaPayments: PayRecord[] = [];
    try {
      prismaUsers = (await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      })) as unknown as UserRecord[];
      prismaSubs = (await prisma.subscription.findMany()) as unknown as SubRecord[];
      prismaPayments = (await prisma.payment.findMany({
        where: { status: 'SUCCESSFUL' },
      })) as unknown as PayRecord[];
    } catch (dbErr) {
      console.warn('Prisma fetch failed in /api/admin/users:', dbErr);
    }

    // 3. Fetch real users and subscriptions from Supabase public tables (using authenticated server client first)
    let supabaseUsers: UserRecord[] = [];
    let supabaseSubs: SubRecord[] = [];
    try {
      const { data: uData } = await supabase
        .from('user')
        .select('*')
        .order('createdAt', { ascending: false });
      supabaseUsers = (uData || []) as unknown as UserRecord[];

      if (supabaseUsers.length === 0) {
        const { data: uDataPublic } = await supabasePublic.from('user').select('*');
        supabaseUsers = (uDataPublic || []) as unknown as UserRecord[];
      }

      const { data: sData } = await supabase
        .from('subscriptions')
        .select('*');
      supabaseSubs = (sData || []) as unknown as SubRecord[];
      if (supabaseSubs.length === 0) {
        const { data: sDataPublic } = await supabasePublic.from('subscriptions').select('*');
        supabaseSubs = (sDataPublic || []) as unknown as SubRecord[];
      }
    } catch (sbErr) {
      console.warn('Supabase fetch failed in /api/admin/users:', sbErr);
    }

    // 4. Merge & Deduplicate ACTUAL Users by Email
    interface MergedUserEntry {
      id: string;
      email: string;
      name: string | null;
      role: string;
      emailVerified: boolean | Date | null;
      createdAt: string | Date;
      referralCode?: string | null;
    }
    const userMap: Record<string, MergedUserEntry> = {};

    // Add real users from Supabase Auth engine first
    authEngineUsers.forEach((u) => {
      const emailKey = (u.email || '').trim().toLowerCase();
      if (!emailKey) return;
      const meta = (u.user_metadata || {}) as Record<string, unknown>;
      const fullName = (meta.full_name as string) || `${(meta.first_name as string) || ''} ${(meta.last_name as string) || ''}`.trim() || emailKey.split('@')[0];
      userMap[emailKey] = {
        id: u.id,
        email: emailKey,
        name: fullName,
        role: (meta.role as string) || (MASTER_ADMIN_EMAILS.includes(emailKey) ? 'admin' : 'user'),
        emailVerified: Boolean(u.email_confirmed_at),
        createdAt: u.created_at || new Date().toISOString(),
        referralCode: (meta.referral_code as string) || (meta.referralCode as string) || null,
      };
    });

    // Add real users from Prisma PostgreSQL
    prismaUsers.forEach((u: UserRecord) => {
      const emailKey = (String(u.email || '')).trim().toLowerCase();
      if (!emailKey) return;
      if (!userMap[emailKey]) {
        userMap[emailKey] = {
          id: u.id,
          email: emailKey,
          name: u.name || emailKey.split('@')[0],
          role: u.role || (MASTER_ADMIN_EMAILS.includes(emailKey) ? 'admin' : 'user'),
          emailVerified: u.emailVerified ?? true,
          createdAt: u.createdAt || new Date().toISOString(),
          referralCode: u.referralCode || null,
        };
      } else {
        // Enrich existing entry if role or name is more specific
        if (u.name && u.name !== emailKey.split('@')[0]) userMap[emailKey].name = u.name;
        if (u.role) userMap[emailKey].role = u.role;
        if (u.referralCode && !userMap[emailKey].referralCode) userMap[emailKey].referralCode = u.referralCode;
      }
    });

    // Add real users from Supabase public table
    supabaseUsers.forEach((u: UserRecord) => {
      const emailKey = (String(u.email || '')).trim().toLowerCase();
      if (!emailKey) return;
      if (!userMap[emailKey]) {
        userMap[emailKey] = {
          id: u.id,
          email: emailKey,
          name: u.name || emailKey.split('@')[0],
          role: u.role || (MASTER_ADMIN_EMAILS.includes(emailKey) ? 'admin' : 'user'),
          emailVerified: u.emailVerified ?? true,
          createdAt: u.createdAt || new Date().toISOString(),
          referralCode: u.referralCode || null,
        };
      } else {
        if (u.referralCode && !userMap[emailKey].referralCode) userMap[emailKey].referralCode = u.referralCode;
      }
    });

    // Ensure Master VIP Admin is always visible
    const masterEmail = MASTER_ADMIN_EMAIL;
    if (!userMap[masterEmail]) {
      userMap[masterEmail] = {
        id: 'master-admin',
        email: masterEmail,
        name: 'Osimen Victor (Master Admin)',
        role: 'admin',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };
    }

    // 5. Determine Actual Active Subscription / Paid Status
    const activeSubEmails = new Set<string>();
    activeSubEmails.add(masterEmail);

    prismaSubs.forEach((sub) => {
      if (sub.status === 'ACTIVE') {
        const u = prismaUsers.find((p) => p.id === sub.userId);
        if (u?.email) activeSubEmails.add(String(u.email).toLowerCase());
      }
    });
    prismaPayments.forEach((pay) => {
      if (pay.status === 'SUCCESSFUL') {
        const u = prismaUsers.find((p) => p.id === pay.userId);
        if (u?.email) activeSubEmails.add(String(u.email).toLowerCase());
      }
    });
    supabaseSubs.forEach((sub) => {
      if (sub.status === 'ACTIVE' || sub.status === 'ACTIVE PRO') {
        const u = supabaseUsers.find((p) => p.id === sub.userId);
        if (u?.email) activeSubEmails.add(String(u.email).toLowerCase());
      }
    });

    // Build final combined ACTUAL user list
    const subscriptionsMap: Record<string, string> = {};
    const mergedUsers = Object.values(userMap).map((u: MergedUserEntry) => {
      const emailStr = String(u.email || '');
      const isPaidPro = activeSubEmails.has(emailStr.toLowerCase());
      subscriptionsMap[u.id] = isPaidPro ? 'ACTIVE' : 'FREE';
      return {
        ...u,
        role: MASTER_ADMIN_EMAILS.includes(emailStr.toLowerCase()) ? 'admin' : (u.role || 'user'),
      };
    });

    return NextResponse.json({
      success: true,
      users: mergedUsers,
      subscriptions: subscriptionsMap,
    });
  } catch (err: unknown) {
    console.error('Error in GET /api/admin/users:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Rate limit: 20 admin writes per minute per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`admin-users-write:${ip}`, RATE_LIMITS.ADMIN_WRITE);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const { user, errorResponse } = await requireMasterAdmin();
    if (errorResponse) return errorResponse;

    const supabase = await createClient();
    const body = await request.json();

    const { email, name, subscriptionStatus = 'FREE' } = body;
    // Allowlist-validate the role field — never trust arbitrary strings from the request body
    const VALID_ROLES = ['user', 'admin'] as const;
    const role = VALID_ROLES.includes(body.role) ? body.role : 'user';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    logAdminAudit("MANUAL_USER_CREATE", { email, role, subscriptionStatus });

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    let prismaUser;
    try {
      prismaUser = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: { role: role || 'user', name: cleanName },
        create: {
          email: cleanEmail,
          name: cleanName,
          role: role || 'user',
          emailVerified: true,
        },
      });

      if (subscriptionStatus === 'ACTIVE' && prismaUser) {
        const now = new Date();
        const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await prisma.subscription.upsert({
          where: { externalSubscriptionId: `admin_${prismaUser.id}` },
          update: { status: 'ACTIVE', currentPeriodEnd: end },
          create: {
            userId: prismaUser.id,
            planId: 'pro_monthly',
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: end,
            externalSubscriptionId: `admin_${prismaUser.id}`,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Could not insert user into Prisma:', dbErr);
    }

    const userId = prismaUser?.id || 'usr_' + Math.random().toString(36).substring(2, 11);
    const newUser = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      role: role || 'user',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase.from('user').upsert([newUser]);
      if (subscriptionStatus === 'ACTIVE') {
        await supabase.from('subscriptions').upsert([
          {
            userId,
            planId: 'pro_monthly',
            status: 'ACTIVE',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      }
    } catch (sbErr) {
      console.warn('Could not insert user into Supabase user table:', sbErr);
    }

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: unknown) {
    console.error('[POST /api/admin/users]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
