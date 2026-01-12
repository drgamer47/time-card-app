-- Add status and is_holiday columns to shifts table

-- Add status column (nullable, for tracking shift status like 'day_off', 'accepted', 'offered')
ALTER TABLE shifts 
  ADD COLUMN IF NOT EXISTS status TEXT;

-- Add is_holiday column (nullable boolean, for holiday pay tracking)
ALTER TABLE shifts 
  ADD COLUMN IF NOT EXISTS is_holiday BOOLEAN DEFAULT FALSE;

-- Add index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);

-- Add index on is_holiday for faster queries
CREATE INDEX IF NOT EXISTS idx_shifts_is_holiday ON shifts(is_holiday);

