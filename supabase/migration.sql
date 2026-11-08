-- Dubai Spurs Score Predictor — initial schema

CREATE TABLE fixtures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date DATE NOT NULL,
  match_time TEXT NOT NULL DEFAULT '15:00',
  venue TEXT,
  competition TEXT NOT NULL DEFAULT 'Premier League',
  is_active BOOLEAN NOT NULL DEFAULT true,
  predictions_open BOOLEAN NOT NULL DEFAULT true,
  actual_home_score INTEGER,
  actual_away_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  home_score INTEGER NOT NULL CHECK (home_score >= 0),
  away_score INTEGER NOT NULL CHECK (away_score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE SET NULL,
  prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  predicted_home INTEGER NOT NULL,
  predicted_away INTEGER NOT NULL,
  actual_home INTEGER NOT NULL,
  actual_away INTEGER NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date DATE NOT NULL,
  competition TEXT NOT NULL DEFAULT 'Premier League',
  drawn_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Fixtures: public read, admin write
CREATE POLICY "fixtures_public_read"  ON fixtures FOR SELECT TO anon        USING (true);
CREATE POLICY "fixtures_admin_all"    ON fixtures FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- Predictions: public insert (members submit), admin read/delete
CREATE POLICY "predictions_public_insert" ON predictions FOR INSERT TO anon         WITH CHECK (true);
CREATE POLICY "predictions_admin_read"    ON predictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "predictions_admin_delete"  ON predictions FOR DELETE TO authenticated USING (true);

-- Winners: public read, admin write
CREATE POLICY "winners_public_read" ON winners FOR SELECT TO anon         USING (true);
CREATE POLICY "winners_admin_all"   ON winners FOR ALL    TO authenticated USING (true) WITH CHECK (true);
