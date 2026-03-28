-- ============================================
-- სამზარეულო კალკულაციის ბაზა
-- Supabase Dashboard → SQL Editor-ში გაუშვით
-- ============================================

-- მომხმარებლები (აპი ამ ცხრილზე ამოწმებს email + პაროლს — არა Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  password_hash   TEXT NOT NULL,  -- აპში პირდაპირი ტექსტი ინახება (სვეტის სახელი ისტორიული)
  role            TEXT NOT NULL DEFAULT 'cook'
    CHECK (role IN ('admin', 'chef', 'cook')),
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ძველ ბაზებს, სადაც name არ იყო — დამატება და შევსება email-იდან
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
UPDATE users
SET name = COALESCE(NULLIF(btrim(name), ''), NULLIF(split_part(email, '@', 1), ''), 'მომხმარებელი')
WHERE name IS NULL OR btrim(COALESCE(name, '')) = '';
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_anon" ON users;
CREATE POLICY "users_select_anon" ON users
  FOR SELECT TO anon, authenticated
  USING (true);

-- ადმინ პანელიდან CRUD (იგივე სიფრთხილე, რაც calculations-ზე — production-ში გაამკაცრეთ)
DROP POLICY IF EXISTS "users_insert_anon" ON users;
CREATE POLICY "users_insert_anon" ON users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "users_update_anon" ON users;
CREATE POLICY "users_update_anon" ON users
  FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "users_delete_anon" ON users;
CREATE POLICY "users_delete_anon" ON users
  FOR DELETE TO anon, authenticated
  USING (true);

-- პირველი მომხმარებლის დამატება (შეცვალეთ email/პაროლი!)
-- INSERT INTO users (email, name, password_hash, role, active)
-- VALUES ('you@example.com', 'სახელი', 'your-password', 'admin', true);

CREATE TABLE IF NOT EXISTS calculations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type            TEXT NOT NULL CHECK (type IN ('bulk', 'portion')),
  name            TEXT NOT NULL,
  category        TEXT,

  -- ულუფები
  servings        INTEGER NOT NULL DEFAULT 1,

  -- გამოსავლიანობა (bulk-ისთვის)
  yield_amount    NUMERIC,
  yield_unit      TEXT DEFAULT 'გ',

  -- ინგრედიენტები JSON სახით
  -- [{ name, qty_g, price_per_kg, cost }]
  ingredients     JSONB NOT NULL DEFAULT '[]',

  -- ღირებულებები
  total_cost        NUMERIC,
  cost_per_serving  NUMERIC,
  cost_per_unit     NUMERIC,

  -- შენიშვნა
  note            TEXT,

  -- თარიღი
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ინდექსები სწრაფი ძიებისთვის
CREATE INDEX IF NOT EXISTS idx_calc_type ON calculations(type);
CREATE INDEX IF NOT EXISTS idx_calc_created ON calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calc_name ON calculations USING gin(to_tsvector('simple', name));

-- Row Level Security
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- პოლიტიკა: ყველასთვის წაკითხვა/ჩაწერა
-- ⚠️ production-ში auth დაამატეთ!
DROP POLICY IF EXISTS "allow_all" ON calculations;
CREATE POLICY "allow_all" ON calculations
  FOR ALL USING (true) WITH CHECK (true);

-- დამატებითი სვეტები calculations (ძველი პროექტებისთვის)
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- კატეგორიები
CREATE TABLE IF NOT EXISTS categories (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('bulk', 'portion')),
  settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_all" ON categories;
CREATE POLICY "categories_all" ON categories
  FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- აუდიტის ჟურნალი
CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_email     TEXT,
  actor_id        UUID,
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  meta            JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_all" ON audit_log;
-- იგივე როლები რაც users/calculations-ზე (anon API key-ით აპი)
CREATE POLICY "audit_all" ON audit_log
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
