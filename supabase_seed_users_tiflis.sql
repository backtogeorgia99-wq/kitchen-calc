-- ============================================
-- ტიფლისი — მომხმარებლების ჩასმა Supabase-ში
-- SQL Editor → ჩასვით → Run
-- პაროლები ინახება password_hash სვეტში (აპის მიხედვით ტექსტური)
-- თუ email უკვე არსებობს — განახლდება სახელი და პაროლი
-- ============================================

INSERT INTO public.users (email, name, password_hash, role, active)
VALUES
  ('nikagogoladze@tiflis.ge', 'nikagogoladze', '1010', 'cook', true),
  ('grigoldekanadze@tiflis.ge', 'grigoldekanadze', '2020', 'cook', true),
  ('migelgorgadze@tiflis.ge', 'migelgorgadze', '3030', 'cook', true),
  ('vakhtanggvianidze@tiflis.ge', 'vakhtanggvianidze', '4040', 'cook', true),
  ('megiberidze@tiflis.ge', 'megiberidze', '5050', 'cook', true),
  ('liaantadze@tiflis.ge', 'liaantadze', '6060', 'cook', true),
  ('indirasurmanidze@tiflis.ge', 'indirasurmanidze', '7070', 'cook', true),
  ('tsiramakharadze@tiflis.ge', 'tsiramakharadze', '8080', 'cook', true),
  ('tamardavitadze@tiflis.ge', 'tamardavitadze', '9090', 'cook', true),
  ('nargizvanadze@tiflis.ge', 'nargizvanadze', '1122', 'cook', true),
  ('shorenabuzhghulashvili@tiflis.ge', 'shorenabuzhghulashvili', '3344', 'cook', true),
  ('venerakochalidze@tiflis.ge', 'venerakochalidze', '5566', 'cook', true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  active = EXCLUDED.active;

-- შემოწმება
SELECT email, name, role, active, created_at FROM public.users ORDER BY email;
