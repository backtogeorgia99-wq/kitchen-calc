-- ============================================
-- Kitchen Calc — Supabase შემოწმება
-- Dashboard → SQL Editor → New query → Run
-- ============================================

-- 1) არსებობს თუ არა ძირითადი ცხრილები
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'calculations', 'categories', 'audit_log')
ORDER BY table_name;

-- 2) users — სვეტები (უნდა იყოს name, email, password_hash, role, active)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3) users — ცარიელი name (უნდა იყოს 0 ხაზი)
SELECT id, email, name
FROM public.users
WHERE name IS NULL OR btrim(COALESCE(name, '')) = '';

-- 4) RLS ჩართულია თუ არა
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('users', 'calculations', 'categories', 'audit_log')
ORDER BY c.relname;

-- 5) RLS პოლიტიკები (anon / authenticated უნდა ჩანდეს სადაც საჭიროა)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'calculations', 'categories', 'audit_log')
ORDER BY tablename, policyname;

-- 6) სწრაფი რაოდენობები
SELECT 'users' AS tbl, count(*)::bigint AS n FROM public.users
UNION ALL SELECT 'calculations', count(*) FROM public.calculations
UNION ALL SELECT 'categories', count(*) FROM public.categories
UNION ALL SELECT 'audit_log', count(*) FROM public.audit_log;

-- 7) ბოლო 5 audit ჩანაწერი (თუ ცხრილი არსებობს)
SELECT id, created_at, action, entity_type, actor_email, meta
FROM public.audit_log
ORDER BY created_at DESC
LIMIT 5;
