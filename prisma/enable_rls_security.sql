-- =============================================================================
-- STRIKE IQ ENTERPRISE SECURITY SCRIPT
-- Enable Row Level Security (RLS) across all database tables
-- =============================================================================

-- 1. Enable RLS on all tables in public schema
ALTER TABLE IF EXISTS public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."user_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."sports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."leagues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."matches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."predictions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."prediction_explanations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."prediction_statistics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."saved_predictions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."payment_webhooks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."ai_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public."verification" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent duplication errors on re-run
DROP POLICY IF EXISTS "Public can view sports" ON public."sports";
DROP POLICY IF EXISTS "Public can view leagues" ON public."leagues";
DROP POLICY IF EXISTS "Public can view teams" ON public."teams";
DROP POLICY IF EXISTS "Public can view matches" ON public."matches";
DROP POLICY IF EXISTS "Public can view predictions" ON public."predictions";
DROP POLICY IF EXISTS "Public can view explanations" ON public."prediction_explanations";
DROP POLICY IF EXISTS "Public can view statistics" ON public."prediction_statistics";
DROP POLICY IF EXISTS "Public can view plans" ON public."plans";

DROP POLICY IF EXISTS "Users can view own profile" ON public."user";
DROP POLICY IF EXISTS "Users can update own profile" ON public."user";
DROP POLICY IF EXISTS "Users can manage own preferences" ON public."user_preferences";
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public."subscriptions";
DROP POLICY IF EXISTS "Users can view own payments" ON public."payments";
DROP POLICY IF EXISTS "Users can manage own saved predictions" ON public."saved_predictions";
DROP POLICY IF EXISTS "Users can view and update own notifications" ON public."notifications";

DROP POLICY IF EXISTS "Admin full access predictions" ON public."predictions";
DROP POLICY IF EXISTS "Admin full access matches" ON public."matches";

-- 3. Create Public Read Access Policies (For sports fixtures, teams, and predictions feed)
CREATE POLICY "Public can view sports" ON public."sports" FOR SELECT USING (true);
CREATE POLICY "Public can view leagues" ON public."leagues" FOR SELECT USING (true);
CREATE POLICY "Public can view teams" ON public."teams" FOR SELECT USING (true);
CREATE POLICY "Public can view matches" ON public."matches" FOR SELECT USING (true);
CREATE POLICY "Public can view predictions" ON public."predictions" FOR SELECT USING (true);
CREATE POLICY "Public can view explanations" ON public."prediction_explanations" FOR SELECT USING (true);
CREATE POLICY "Public can view statistics" ON public."prediction_statistics" FOR SELECT USING (true);
CREATE POLICY "Public can view plans" ON public."plans" FOR SELECT USING (true);

-- 4. Create User Private Access Policies (For notifications, bookmarks, and subscriptions)
CREATE POLICY "Users can view own profile" ON public."user" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON public."user" FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can manage own preferences" ON public."user_preferences" FOR ALL USING (auth.uid()::text = "userId");
CREATE POLICY "Users can view own subscriptions" ON public."subscriptions" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can view own payments" ON public."payments" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users can manage own saved predictions" ON public."saved_predictions" FOR ALL USING (auth.uid()::text = "userId");
CREATE POLICY "Users can view and update own notifications" ON public."notifications" FOR ALL USING (auth.uid()::text = "userId");

-- 5. Create Admin Override Policies (For osimenvictor09@gmail.com)
CREATE POLICY "Admin full access predictions" ON public."predictions" FOR ALL USING (auth.jwt() ->> 'email' = 'osimenvictor09@gmail.com');
CREATE POLICY "Admin full access matches" ON public."matches" FOR ALL USING (auth.jwt() ->> 'email' = 'osimenvictor09@gmail.com');

-- Note: Prisma ORM API routes connect using database service roles, automatically bypassing RLS securely on server endpoints.
