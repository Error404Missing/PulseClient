-- ==============================================================================
-- PULSECLIENT // SUPABASE DYNAMIC ADMIN ROLES SYSTEM
-- ==============================================================================
-- გაუშვით ეს სკრიპტი თქვენს Supabase პროექტში (SQL Editor-ში).
-- ამის შემდეგ ადმინისტრატორის დამატება შეგეძლებათ:
-- 1) პირდაპირ 'profiles' ცხრილიდან (role სვეტში 'admin'-ის ჩაწერით)
-- 2) პირდაპირ 'admins' ცხრილიდან (Discord ID-ის ჩამატებით)
-- 3) საიტის Admin Panel-იდან (ადმინების ჩანართიდან)
-- და აღარასდროს დაგჭირდებათ app.js-ის რედაქტირება და საიტის თავიდან ატვირთვა!
-- ==============================================================================

-- 1. დავამატოთ 'role' სვეტი profiles ცხრილში (თუ ჯერ არ არსებობს)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. შევქმნათ ცალკე 'admins' ცხრილი Discord ID-ებით მარტივი მართვისთვის
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT,
    role TEXT NOT NULL DEFAULT 'admin', -- 'admin' ან 'owner'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT DEFAULT 'Supabase'
);

-- 3. ჩავრთოთ Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- პოლიტიკები: წაკითხვა, დამატება, რედაქტირება და წაშლა
DROP POLICY IF EXISTS "Allow select admins" ON public.admins;
CREATE POLICY "Allow select admins" ON public.admins FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert admins" ON public.admins;
CREATE POLICY "Allow insert admins" ON public.admins FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update admins" ON public.admins;
CREATE POLICY "Allow update admins" ON public.admins FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete admins" ON public.admins;
CREATE POLICY "Allow delete admins" ON public.admins FOR DELETE USING (true);

-- 4. ავტომატურად ჩავწეროთ არსებული ადმინები admins ცხრილში
INSERT INTO public.admins (discord_id, username, role)
VALUES 
    ('1475396409246089367', 'Owner (Sticky/Error404)', 'owner'),
    ('1158855771031867432', 'Admin', 'admin'),
    ('1272601735051083797', 'Admin', 'admin'),
    ('1350538035342737441', 'Admin', 'admin')
ON CONFLICT (discord_id) DO UPDATE SET role = EXCLUDED.role;

-- 5. განვაახლოთ არსებული პროფილები 'profiles' ცხრილშიც
UPDATE public.profiles
SET role = 'owner'
WHERE discord_id = '1475396409246089367' 
   OR username ILIKE '%error404%' 
   OR username ILIKE '%sticky%';

UPDATE public.profiles
SET role = 'admin'
WHERE discord_id IN ('1158855771031867432', '1272601735051083797', '1350538035342737441')
  AND (role IS NULL OR role = 'user');
