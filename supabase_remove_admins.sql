-- ==============================================================================
-- PULSECLIENT // REMOVE ALL ADMINISTRATORS (owner stays)
-- ==============================================================================
-- გაუშვით Supabase → SQL Editor-ში. ამოწმებს ორ ადგილს:
--   1) public.admins  — ცხრილში რჩება მხოლოდ owner
--   2) public.profiles — ყველა ადმინის/სტაფის როლი უბრუნდება 'user'-ს
-- ==============================================================================

-- 1. admins ცხრილში მხოლოდ owner რჩება
DELETE FROM public.admins
WHERE lower(coalesce(role, '')) <> 'owner'
  AND discord_id <> '1475396409246089367';

-- 2. profiles-ში ადმინისტრატორის როლები უკან 'user'-ზე
UPDATE public.profiles
SET role = 'user'
WHERE lower(coalesce(role, '')) IN ('admin', 'staff', 'mod', 'moderator');

-- 3. შემოწმება: უნდა დარჩეს მხოლოდ owner
SELECT discord_id, username, role FROM public.admins ORDER BY created_at;
SELECT discord_id, username, role FROM public.profiles WHERE role <> 'user';
