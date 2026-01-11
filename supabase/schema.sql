-- Walmart Hours Tracker Database Schema

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  
  -- Scheduled times (nullable, for future schedule entry)
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  
  -- Actual times
  actual_start TIMESTAMPTZ NOT NULL,
  actual_end TIMESTAMPTZ NOT NULL,
  
  -- Lunch (nullable for shifts ≤5 hours)
  lunch_start TIMESTAMPTZ,
  lunch_end TIMESTAMPTZ,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shifts_user_date ON shifts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_user_created ON shifts(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own shifts"
  ON shifts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shifts"
  ON shifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shifts"
  ON shifts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shifts"
  ON shifts FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

