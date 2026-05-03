-- Run this in your Supabase SQL Editor (https://app.supabase.com → SQL Editor)

-- 1. Create the fundraising table
CREATE TABLE IF NOT EXISTS fundraising (
  id BIGINT PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Building Fund',
  current NUMERIC NOT NULL DEFAULT 0,
  goal NUMERIC NOT NULL DEFAULT 100000,
  currency TEXT NOT NULL DEFAULT 'R',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert the initial row (only one row needed, id=1)
INSERT INTO fundraising (id, title, current, goal, currency)
VALUES (1, 'Building Fund', 0, 100000, 'R')
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security
ALTER TABLE fundraising ENABLE ROW LEVEL SECURITY;

-- 4. Allow public READ (so the barometer can display without auth)
CREATE POLICY "Public read access"
ON fundraising
FOR SELECT
TO anon
USING (true);

-- 5. Enable real-time for this table
-- Go to: Supabase Dashboard → Database → Replication
-- Enable replication for the "fundraising" table
-- OR run:
ALTER PUBLICATION supabase_realtime ADD TABLE fundraising;
