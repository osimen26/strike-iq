import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { requireMasterAdmin, logAdminAudit } from '@/lib/security/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    // 1. Fetch real users from Supabase Auth engine (auth.users) if Admin key is available
    let authEngineUsers: any[] = [];
    if (supabaseAdmin) {
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
        if (authData?.users) {
          authEngineUsers = authData.users;
        }
      } catch (authErr) {
        console.warn('Supabase Auth admin listUsers fetch warning:', authErr);
      }
    }

    // 2. Fetch real users and subscriptions from Prisma PostgreSQL
    let prismaUsers: any[] = [];
    let prismaSubs: any[] = [];
    let prismaPayments: any[] = [];
    try {
      prismaUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      prismaSubs = await prisma.subscription.findMany();
      prismaPayments = await prisma.payment.findMany({
        where: { status: 'SUCCESSFUL' },
      });
    } catch (dbErr) {
      console.warn('Prisma fetch failed in /api/admin/users:', dbErr);
    }

    // 3. Fetch real users and subscriptions from Supabase public tables
    let supabaseUsers: any[] = [];
    let supabaseSubs: any[] = [];
    try {
      const { data: uData } = await supabasePublic
        .from('user')
        .select('*')
        .order('createdAt', { ascending: false });
      supabaseUsers = uData || [];

      const { data: sData } = await supabasePublic
        .from('subscriptions')
        .select('*');
      supabaseSubs = sData || [];
    } catch (sbErr) {
      console.warn('Supabase fetch failed in /api/admin/users:', sbErr);
    }

    // 4. Merge & Deduplicate ACTUAL Users by Email
    const userMap: Record<string, any> = {};

    // Add real users from Supabase Auth engine first
    authEngineUsers.forEach((u) => {
      const emailKey = (u.email || '').trim().toLowerCase();
      if (!emailKey) return;
      const meta = u.user_metadata || {};
      const fullName = meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || emailKey.split('@')[0];
      userMap[emailKey] = {
        id: u.id,
        email: emailKey,
        name: fullName,
        role: meta.role || (emailKey === 'osimenvictor04@gmail.com' ? 'admin' : 'user'),
        emailVerified: Boolean(u.email_confirmed_at),
        createdAt: u.created_at || new Date().toISOString(),
        referralCode: meta.referral_code || meta.referralCode || null,
      };
    });

    // Add real users from Prisma PostgreSQL
    prismaUsers.forEach((u: any) => {
      const emailKey = (u.email || '').trim().toLowerCase();
      if (!emailKey) return;
      if (!userMap[emailKey]) {
        userMap[emailKey] = {
          id: u.id,
          email: emailKey,
          name: u.name || emailKey.split('@')[0],
          role: u.role || (emailKey === 'osimenvictor04@gmail.com' ? 'admin' : 'user'),
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
    supabaseUsers.forEach((u: any) => {
      const emailKey = (u.email || '').trim().toLowerCase();
      if (!emailKey) return;
      if (!userMap[emailKey]) {
        userMap[emailKey] = {
          id: u.id,
          email: emailKey,
          name: u.name || emailKey.split('@')[0],
          role: u.role || (emailKey === 'osimenvictor04@gmail.com' ? 'admin' : 'user'),
          emailVerified: u.emailVerified ?? true,
          createdAt: u.createdAt || new Date().toISOString(),
          referralCode: u.referralCode || null,
        };
      } else {
        if (u.referralCode && !userMap[emailKey].referralCode) userMap[emailKey].referralCode = u.referralCode;
      }
    });

    // Ensure Master VIP Admin is always visible
    const masterEmail = 'osimenvictor04@gmail.com';
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
        if (u?.email) activeSubEmails.add(u.email.toLowerCase());
      }
    });
    prismaPayments.forEach((pay) => {
      if (pay.status === 'SUCCESSFUL') {
        const u = prismaUsers.find((p) => p.id === pay.userId);
        if (u?.email) activeSubEmails.add(u.email.toLowerCase());
      }
    });
    supabaseSubs.forEach((sub) => {
      if (sub.status === 'ACTIVE' || sub.status === 'ACTIVE PRO') {
        const u = supabaseUsers.find((p) => p.id === sub.userId);
        if (u?.email) activeSubEmails.add(u.email.toLowerCase());
      }
    });

    // Build final combined ACTUAL user list
    const subscriptionsMap: Record<string, string> = {};
    const mergedUsers = Object.values(userMap).map((u) => {
      const isPaidPro = activeSubEmails.has(u.email.toLowerCase());
      subscriptionsMap[u.id] = isPaidPro ? 'ACTIVE' : 'FREE';
      return {
        ...u,
        role: u.email.toLowerCase() === 'osimenvictor04@gmail.com' ? 'admin' : 'user',
      };
    });

    return NextResponse.json({
      success: true,
      users: mergedUsers,
      subscriptions: subscriptionsMap,
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/users:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
  } catch (err: any) {
    console.error('[POST /api/admin/users]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
