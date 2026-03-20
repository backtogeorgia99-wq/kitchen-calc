-- ============================================
-- სამზარეულო კალკულაციის ბაზა
-- Supabase Dashboard → SQL Editor-ში გაუშვით
-- ============================================

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
