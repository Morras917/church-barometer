CREATE TABLE IF NOT EXISTS fundraising (
  id BIGINT PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'St Peters Church Organ Fund',
  current NUMERIC NOT NULL DEFAULT 0,
  goal NUMERIC NOT NULL DEFAULT 500000,
  currency TEXT NOT NULL DEFAULT 'R',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO fundraising (id, title, current, goal, currency)
VALUES (1, 'St Peters Church Organ Fund', 0, 500000, 'R')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE fundraising ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON fundraising FOR SELECT TO anon USING (true);

CREATE POLICY "Public update access"
ON fundraising FOR UPDATE TO anon USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE fundraising;